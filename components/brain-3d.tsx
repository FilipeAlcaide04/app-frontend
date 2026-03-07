"use client"

import { useRef, useMemo, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Float, Html } from "@react-three/drei"
import type * as THREE from "three"

interface Agent {
  name: string
  description: string
  color: string
  position: [number, number, number]
}

const agents: Agent[] = [
  {
    name: "Lógico",
    description: "Matemática, programação, raciocínio lógico",
    color: "#0088ff",
    position: [0, 1.2, 0.8],
  },
  {
    name: "Emocional",
    description: "Sentimentos, empatia, vínculos",
    color: "#ff3366",
    position: [-1.1, 0.3, 0.5],
  },
  {
    name: "Criativo",
    description: "Ideias novas, arte, música, humor",
    color: "#aa00ff",
    position: [1.1, 0.3, 0.5],
  },
  {
    name: "Memória",
    description: "Experiências, aprendizados, referências",
    color: "#00ff88",
    position: [-0.7, -0.8, 0.6],
  },
  {
    name: "Instinto",
    description: "Medo, prazer, resposta a ameaças",
    color: "#ff8800",
    position: [0.7, -0.8, 0.6],
  },
  {
    name: "Social",
    description: "Linguagem, normas sociais, reputação",
    color: "#ffee00",
    position: [0, 0.2, 1.2],
  },
  {
    name: "Executivo",
    description: "Foco, atenção, autocontrolo",
    color: "#00ffff",
    position: [0, 0.8, -0.3],
  },
]

function AgentNode({ agent, index }: { agent: Agent; index: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const [intensity, setIntensity] = useState(0.3)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // Random pulsing intensity
    const baseIntensity = 0.3 + Math.sin(time * 2 + index * 1.5) * 0.2
    const randomPulse = Math.random() > 0.98 ? 1.5 : 0
    setIntensity(baseIntensity + randomPulse + (hovered ? 0.5 : 0))
    
    // Subtle floating movement
    if (meshRef.current) {
      meshRef.current.position.y = agent.position[1] + Math.sin(time + index) * 0.05
    }
  })

  return (
    <group position={agent.position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[0.25, 32, 32]} />
        <meshStandardMaterial
          color={agent.color}
          emissive={agent.color}
          emissiveIntensity={intensity}
          metalness={0.3}
          roughness={0.4}
        />
      </mesh>
      
      {/* Glow effect */}
      <pointLight color={agent.color} intensity={intensity * 2} distance={2} />
      
      {/* Outer glow sphere */}
      <mesh scale={1.4}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshBasicMaterial color={agent.color} transparent opacity={intensity * 0.15} />
      </mesh>
      
      {/* Label on hover */}
      {hovered && (
        <Html position={[0, 0.5, 0]} center>
          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 min-w-[160px] shadow-xl">
            <p className="text-foreground font-semibold text-sm">{agent.name}</p>
            <p className="text-muted-foreground text-xs">{agent.description}</p>
          </div>
        </Html>
      )}
    </group>
  )
}

function NeuralConnections() {
  const linesRef = useRef<THREE.Group>(null)
  
  const connections = useMemo(() => {
    const conns: { start: [number, number, number]; end: [number, number, number] }[] = []
    
    // Create connections between nearby agents
    for (let i = 0; i < agents.length; i++) {
      for (let j = i + 1; j < agents.length; j++) {
        conns.push({
          start: agents[i].position,
          end: agents[j].position,
        })
      }
    }
    return conns
  }, [])

  useFrame((state) => {
    if (linesRef.current) {
      linesRef.current.children.forEach((child, i) => {
        const material = (child as THREE.Line).material as THREE.LineBasicMaterial
        const time = state.clock.getElapsedTime()
        const pulse = Math.sin(time * 3 + i * 0.5) * 0.5 + 0.5
        material.opacity = 0.1 + pulse * 0.2
      })
    }
  })

  return (
    <group ref={linesRef}>
      {connections.map((conn, i) => {
        const points = [
          new Float32Array([...conn.start, ...conn.end])
        ]
        return (
          <line key={i}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                args={[new Float32Array([...conn.start, ...conn.end]), 3]}
              />
            </bufferGeometry>
            <lineBasicMaterial color="#4488ff" transparent opacity={0.2} />
          </line>
        )
      })}
    </group>
  )
}

function BrainMesh() {
  const brainRef = useRef<THREE.Group>(null)

  useFrame((state) => {
    if (brainRef.current) {
      brainRef.current.rotation.y = state.clock.getElapsedTime() * 0.1
    }
  })

  return (
    <Float speed={0.5} rotationIntensity={0.05} floatIntensity={0.1}>
      <group ref={brainRef}>
        {/* Brain hemisphere - left */}
        <mesh position={[-0.4, 0, 0]}>
          <sphereGeometry args={[1, 64, 64, 0, Math.PI]} />
          <meshStandardMaterial
            color="#2a3050"
            emissive="#1a2040"
            emissiveIntensity={0.3}
            metalness={0.2}
            roughness={0.8}
            wireframe={false}
            transparent
            opacity={0.6}
          />
        </mesh>
        
        {/* Brain hemisphere - right */}
        <mesh position={[0.4, 0, 0]} rotation={[0, Math.PI, 0]}>
          <sphereGeometry args={[1, 64, 64, 0, Math.PI]} />
          <meshStandardMaterial
            color="#2a3050"
            emissive="#1a2040"
            emissiveIntensity={0.3}
            metalness={0.2}
            roughness={0.8}
            transparent
            opacity={0.6}
          />
        </mesh>
        
        {/* Inner glow */}
        <mesh>
          <sphereGeometry args={[0.9, 32, 32]} />
          <meshBasicMaterial color="#1a3060" transparent opacity={0.3} />
        </mesh>
        
        {/* Neural connections */}
        <NeuralConnections />
        
        {/* Agent nodes */}
        {agents.map((agent, index) => (
          <AgentNode key={agent.name} agent={agent} index={index} />
        ))}
      </group>
    </Float>
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
      <fog attach="fog" args={["#0a0a12", 6, 15]} />
      
      <ambientLight intensity={0.2} />
      <directionalLight position={[5, 5, 5]} intensity={0.5} />
      <directionalLight position={[-5, -5, -5]} intensity={0.3} color="#0066ff" />
      
      <BrainMesh />
      
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
