"use client"

import { useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Html, Environment, useGLTF } from "@react-three/drei"
import * as THREE from "three"

interface BrainRegion {
  name: string
  emotion: string
  description: string
  color: string
  position: [number, number, number]
}

const regions: BrainRegion[] = [
  {
    name: "Córtex Pré-frontal",
    emotion: "Autocontrolo",
    description: "Regula impulsos, planeamento e tomada de decisão racional",
    color: "#00d4ff",
    position: [0.0, 0.55, 0.66],
  },
  {
    name: "Amígdala",
    emotion: "Medo",
    description: "Deteta ameaças, ativa alerta emocional e reação de sobrevivência",
    color: "#ff3366",
    position: [-0.26, -0.12, 0.35],
  },
  {
    name: "Núcleo Accumbens",
    emotion: "Prazer",
    description: "Relaciona-se com recompensa, motivação e sensação de conquista",
    color: "#ffd400",
    position: [0.26, -0.1, 0.35],
  },
  {
    name: "Hipocampo",
    emotion: "Memória Afetiva",
    description: "Consolida memórias e liga experiências a estados emocionais",
    color: "#00ff88",
    position: [-0.4, -0.45, 0.12],
  },
  {
    name: "Córtex Insular",
    emotion: "Empatia",
    description: "Perceção interna do corpo, dor social e leitura emocional do outro",
    color: "#ff8a00",
    position: [0.6, 0.05, 0.15],
  },
  {
    name: "Córtex Temporal",
    emotion: "Vínculo Social",
    description: "Interpreta voz, rosto e sinais sociais importantes para conexão",
    color: "#a855f7",
    position: [-0.62, 0.05, 0.16],
  },
  {
    name: "Lobo Occipital",
    emotion: "Imaginação",
    description: "Transforma estímulos visuais em imagens mentais e criatividade",
    color: "#3b82f6",
    position: [0, 0.22, -0.56],
  },
]

const overlayVertexShader = `
varying vec3 vLocalPos;

void main() {
  vLocalPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

const overlayFragmentShader = `
uniform float uTime;
uniform vec3 uCenters[7];
uniform vec3 uColors[7];
varying vec3 vLocalPos;

void main() {
  vec3 blended = vec3(0.0);
  float total = 0.0;

  for (int i = 0; i < 7; i++) {
    float d = distance(vLocalPos, uCenters[i]);
    float pulse = 0.9 + 0.1 * sin(uTime * 2.2 + float(i));
    float w = exp(-pow(d / 0.42, 2.0)) * pulse;
    blended += uColors[i] * w;
    total += w;
  }

  if (total < 0.12) {
    discard;
  }

  vec3 colorOut = blended / max(total, 0.0001);
  float alpha = clamp(total * 0.26, 0.0, 0.42);
  gl_FragColor = vec4(colorOut, alpha);
}
`

function EmotionMarker({ region, index }: { region: BrainRegion; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.getElapsedTime()
      const material = meshRef.current.material as THREE.MeshStandardMaterial
      material.emissiveIntensity = 0.7 + Math.sin(time * 2 + index * 0.7) * 0.22 + (hovered ? 0.35 : 0)
      meshRef.current.scale.setScalar(hovered ? 1.25 : 1)
    }
  })

  return (
    <group position={region.position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.055, 28, 28]} />
        <meshStandardMaterial
          color={region.color}
          emissive={region.color}
          emissiveIntensity={0.9}
          metalness={0.1}
          roughness={0.25}
        />
      </mesh>

      <pointLight color={region.color} intensity={hovered ? 1 : 0.45} distance={0.8} />

      <mesh scale={hovered ? 1.6 : 1.35}>
        <sphereGeometry args={[0.055, 20, 20]} />
        <meshBasicMaterial color={region.color} transparent opacity={hovered ? 0.22 : 0.1} />
      </mesh>

      {hovered && (
        <Html position={[0, 0.22, 0]} center distanceFactor={8}>
          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 min-w-[200px] shadow-xl">
            <p className="text-foreground font-semibold text-sm">{region.name}</p>
            <p className="text-xs font-medium" style={{ color: region.color }}>
              Emoção: {region.emotion}
            </p>
            <p className="text-muted-foreground text-xs mt-1">{region.description}</p>
          </div>
        </Html>
      )}
    </group>
  )
}

function RealisticBrain() {
  const brainRef = useRef<THREE.Group>(null)
  const { scene } = useGLTF("/models/brain.glb")

  const normalized = useMemo(() => {
    let sourceGeometry: THREE.BufferGeometry | null = null

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && !sourceGeometry) {
        sourceGeometry = (child as THREE.Mesh).geometry
      }
    })

    if (!sourceGeometry) return null

    const geometry = sourceGeometry.clone()
    geometry.computeVertexNormals()
    geometry.computeBoundingBox()

    const box = geometry.boundingBox
    if (!box) return null

    const size = new THREE.Vector3()
    const center = new THREE.Vector3()
    box.getSize(size)
    box.getCenter(center)
    geometry.translate(-center.x, -center.y, -center.z)

    const maxDim = Math.max(size.x, size.y, size.z)
    const scale = 2.5 / maxDim

    return { geometry, scale }
  }, [scene])

  const overlayUniforms = useMemo(() => {
    return {
      uTime: { value: 0 },
      uCenters: { value: regions.map((region) => new THREE.Vector3(...region.position)) },
      uColors: { value: regions.map((region) => new THREE.Color(region.color)) },
    }
  }, [])

  useFrame((state) => {
    overlayUniforms.uTime.value = state.clock.getElapsedTime()

    if (brainRef.current) {
      const time = state.clock.getElapsedTime()
      brainRef.current.rotation.y = time * 0.12
      brainRef.current.rotation.x = Math.sin(time * 0.35) * 0.06
      brainRef.current.position.y = Math.sin(time * 0.9) * 0.04
    }
  })

  if (!normalized) {
    return null
  }

  return (
    <group ref={brainRef}>
      <group scale={normalized.scale}>
        <mesh geometry={normalized.geometry} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#d8a3a3"
            roughness={0.72}
            metalness={0.02}
            clearcoat={0.08}
            clearcoatRoughness={0.75}
            sheen={0.35}
            sheenColor="#ffb7b7"
            emissive="#3a1d1d"
            emissiveIntensity={0.06}
          />
        </mesh>

        <mesh geometry={normalized.geometry} scale={1.003} renderOrder={2}>
          <shaderMaterial
            transparent
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            uniforms={overlayUniforms}
            vertexShader={overlayVertexShader}
            fragmentShader={overlayFragmentShader}
          />
        </mesh>

        {regions.map((region, index) => (
          <EmotionMarker key={region.name} region={region} index={index} />
        ))}
      </group>
    </group>
  )
}

export function Brain3D() {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      className="w-full h-full"
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#0a0a12"]} />
      <fog attach="fog" args={["#0a0a12", 5.5, 13]} />

      <ambientLight intensity={0.48} />
      <hemisphereLight intensity={0.38} color="#ffd4d4" groundColor="#0a0a12" />
      <directionalLight position={[4, 5, 5]} intensity={0.95} color="#fff0ef" />
      <directionalLight position={[-5, 2, -4]} intensity={0.34} color="#86a6ff" />
      <pointLight position={[0, 2, 2]} intensity={0.45} color="#ffdede" distance={8} />

      <RealisticBrain />

      <Environment preset="studio" />
      
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={8}
        autoRotate
        autoRotateSpeed={0.5}
      />
    </Canvas>
  )
}

useGLTF.preload("/models/brain.glb")
