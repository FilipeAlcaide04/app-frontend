"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment, Html, useGLTF } from "@react-three/drei"
import * as THREE from "three"

interface BrainRegion {
  name: string
  emotion: string
  description: string
  color: string
  position: [number, number, number]
  radius: number
}

const regions: BrainRegion[] = [
  {
    name: "Córtex Pré-frontal",
    emotion: "Autocontrolo",
    description: "Regula impulsos, planeamento e tomada de decisão racional",
    color: "#00f7ff",
    position: [0.0, 0.62, 0.58],
    radius: 0.74,
  },
  {
    name: "Córtex Parietal",
    emotion: "Atenção",
    description: "Integra informação sensorial e mantém foco espacial no ambiente",
    color: "#ff35ff",
    position: [0.0, 0.88, 0.1],
    radius: 0.68,
  },
  {
    name: "Amígdala",
    emotion: "Medo",
    description: "Deteta ameaças, ativa alerta emocional e reação de sobrevivência",
    color: "#ff1455",
    position: [-0.26, -0.12, 0.35],
    radius: 0.52,
  },
  {
    name: "Núcleo Accumbens",
    emotion: "Prazer",
    description: "Relaciona-se com recompensa, motivação e sensação de conquista",
    color: "#fff000",
    position: [0.26, -0.1, 0.35],
    radius: 0.52,
  },
  {
    name: "Hipocampo",
    emotion: "Memória Afetiva",
    description: "Consolida memórias e liga experiências a estados emocionais",
    color: "#00ff95",
    position: [-0.4, -0.45, 0.12],
    radius: 0.54,
  },
  {
    name: "Córtex Insular",
    emotion: "Empatia",
    description: "Perceção interna do corpo, dor social e leitura emocional do outro",
    color: "#ff7300",
    position: [0.6, 0.05, 0.15],
    radius: 0.56,
  },
  {
    name: "Córtex Temporal",
    emotion: "Vínculo Social",
    description: "Interpreta voz, rosto e sinais sociais importantes para conexão",
    color: "#bf00ff",
    position: [-0.62, 0.05, 0.16],
    radius: 0.56,
  },
  {
    name: "Lobo Occipital",
    emotion: "Imaginação",
    description: "Transforma estímulos visuais em imagens mentais e criatividade",
    color: "#2390ff",
    position: [0, 0.22, -0.56],
    radius: 0.62,
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
uniform vec3 uCenters[8];
uniform vec3 uColors[8];
uniform float uRadii[8];
varying vec3 vLocalPos;

void main() {
  float nearestD = 1000.0;
  float secondD = 1000.0;
  int nearestI = 0;
  int secondI = 0;

  for (int i = 0; i < 8; i++) {
    float d = distance(vLocalPos, uCenters[i]) / uRadii[i];

    if (d < nearestD) {
      secondD = nearestD;
      secondI = nearestI;
      nearestD = d;
      nearestI = i;
    } else if (d < secondD) {
      secondD = d;
      secondI = i;
    }
  }

  // Cor dominante por região + transição curta apenas na fronteira.
  float edgeBand = 0.07;
  float edgeDelta = secondD - nearestD;
  float edgeMix = 1.0 - smoothstep(0.0, edgeBand, edgeDelta);
  vec3 hardColor = uColors[nearestI];
  vec3 neighborColor = uColors[secondI];
  vec3 blended = mix(hardColor, neighborColor, edgeMix * 0.5);

  // Menos saturação/intensidade para preservar leitura dos sulcos do modelo.
  vec3 colorOut = pow(blended, vec3(1.04)) * 0.9;
  colorOut = clamp(colorOut, 0.0, 1.0);

  // Cobertura contínua para evitar áreas "mal pintadas" no fundo.
  float coverage = smoothstep(1.35, 0.82, nearestD);
  vec3 baseTint = vec3(0.86, 0.82, 0.87);
  colorOut = mix(baseTint, colorOut, coverage);

  float pulse = 0.88 + 0.12 * sin(uTime * 2.0 + float(nearestI));
  float alpha = mix(0.28, 0.52, coverage) * pulse;
  alpha = clamp(alpha, 0.24, 0.56);

  gl_FragColor = vec4(colorOut, alpha);
}
`

function RealisticBrain() {
  const brainRef = useRef<THREE.Group>(null)
  const [hoveredRegionIndex, setHoveredRegionIndex] = useState<number | null>(null)
  const hoveredRegionRef = useRef<number | null>(null)
  const outTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const switchCandidateRef = useRef<{ index: number; since: number } | null>(null)
  const { scene } = useGLTF("/models/brain.glb")

  const hoveredRegion = hoveredRegionIndex !== null ? regions[hoveredRegionIndex] : null

  const normalized = useMemo(() => {
    let sourceGeometry: THREE.BufferGeometry | undefined

    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && !sourceGeometry) {
        sourceGeometry = child.geometry as THREE.BufferGeometry
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
      uRadii: { value: regions.map((region) => region.radius) },
    }
  }, [])

  useFrame((state) => {
    overlayUniforms.uTime.value = state.clock.getElapsedTime()
  })

  useEffect(() => {
    hoveredRegionRef.current = hoveredRegionIndex
  }, [hoveredRegionIndex])

  useEffect(() => {
    return () => {
      if (outTimerRef.current) {
        clearTimeout(outTimerRef.current)
      }
    }
  }, [])

  const getRegionDistance = (localPoint: THREE.Vector3, regionIndex: number): number => {
    const center = new THREE.Vector3(...regions[regionIndex].position)
    return center.distanceTo(localPoint) / regions[regionIndex].radius
  }

  const getNearestRegionIndex = (localPoint: THREE.Vector3): { index: number; distance: number } | null => {
    let nearestD = Number.POSITIVE_INFINITY
    let nearestIndex = -1

    for (let i = 0; i < regions.length; i++) {
      const d = getRegionDistance(localPoint, i)

      if (d < nearestD) {
        nearestD = d
        nearestIndex = i
      }
    }

    return nearestD <= 1.08 ? { index: nearestIndex, distance: nearestD } : null
  }

  if (!normalized) {
    return null
  }

  return (
    <group ref={brainRef}>
      <group scale={normalized.scale}>
        <mesh geometry={normalized.geometry} castShadow receiveShadow>
          <meshStandardMaterial
            color="#e7c9c9"
            roughness={0.42}
            metalness={0}
            emissive="#2b1618"
            emissiveIntensity={0.02}
            flatShading={false}
          />
        </mesh>

        <mesh geometry={normalized.geometry} scale={1.006} renderOrder={2}>
          <shaderMaterial
            transparent
            depthWrite={false}
            depthTest
            polygonOffset
            polygonOffsetFactor={-1}
            polygonOffsetUnits={-1}
            blending={THREE.NormalBlending}
            uniforms={overlayUniforms}
            vertexShader={overlayVertexShader}
            fragmentShader={overlayFragmentShader}
          />
        </mesh>

        <mesh
          geometry={normalized.geometry}
          scale={1.01}
          onPointerMove={(event) => {
            event.stopPropagation()
            if (outTimerRef.current) {
              clearTimeout(outTimerRef.current)
              outTimerRef.current = null
            }

            const localPoint = event.object.worldToLocal(event.point.clone())

            const nearest = getNearestRegionIndex(localPoint)
            const current = hoveredRegionRef.current

            if (!nearest) {
              // Evita flicker quando há micro-falhas de raycast perto dos limites.
              if (current !== null) {
                const currentDistance = getRegionDistance(localPoint, current)
                if (currentDistance <= 1.16) {
                  return
                }
              }

              switchCandidateRef.current = null
              if (current !== null) {
                setHoveredRegionIndex(null)
              }
              return
            }

            if (current === nearest.index) {
              switchCandidateRef.current = null
              return
            }

            if (current !== null) {
              const currentDistance = getRegionDistance(localPoint, current)

              // Histerese + debounce: só troca se a nova região for claramente melhor
              // e se a intenção persistir por alguns ms.
              if (currentDistance <= 1.14) {
                const isClearlyBetter = nearest.distance + 0.12 < currentDistance
                if (!isClearlyBetter) {
                  switchCandidateRef.current = null
                  return
                }

                const now = performance.now()
                const candidate = switchCandidateRef.current
                if (!candidate || candidate.index !== nearest.index) {
                  switchCandidateRef.current = { index: nearest.index, since: now }
                  return
                }

                if (now - candidate.since < 120) {
                  return
                }

                switchCandidateRef.current = null
                setHoveredRegionIndex(nearest.index)
                return
              }
            }

            switchCandidateRef.current = null
            setHoveredRegionIndex(nearest.index)
          }}
          onPointerOut={() => {
            if (outTimerRef.current) {
              clearTimeout(outTimerRef.current)
            }

            switchCandidateRef.current = null

            outTimerRef.current = setTimeout(() => {
              setHoveredRegionIndex(null)
              outTimerRef.current = null
            }, 160)
          }}
        >
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {hoveredRegion && (
          <Html
            position={[
              hoveredRegion.position[0],
              hoveredRegion.position[1] + 0.2,
              hoveredRegion.position[2],
            ]}
            center
          >
            <div className="pointer-events-none select-none bg-card/95 backdrop-blur-sm border border-border rounded-md px-2 py-1.5 min-w-[clamp(120px,16vw,150px)] max-w-[clamp(150px,20vw,180px)] shadow-xl">
              <p className="text-foreground font-semibold text-[clamp(10px,0.9vw,12px)] leading-tight">{hoveredRegion.name}</p>
              <p className="text-[clamp(9px,0.8vw,11px)] font-semibold mt-0.5" style={{ color: hoveredRegion.color }}>
                Emoção: {hoveredRegion.emotion}
              </p>
              <p className="text-muted-foreground text-[clamp(8px,0.72vw,10px)] mt-1 leading-snug">{hoveredRegion.description}</p>
            </div>
          </Html>
        )}
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
      <pointLight position={[0, 2, 2]} intensity={0.52} color="#ffdede" distance={8} />

      <RealisticBrain />

      <Environment preset="studio" />
      
      <OrbitControls
        enablePan={false}
        enableZoom={true}
        minDistance={3}
        maxDistance={8}
        autoRotate={false}
      />
    </Canvas>
  )
}

useGLTF.preload("/models/brain.glb")
