"use client"

import { useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, Float, MeshDistortMaterial } from "@react-three/drei"
import type * as THREE from "three"

function HumanoidAvatar() {
  const headRef = useRef<THREE.Mesh>(null)
  const bodyRef = useRef<THREE.Mesh>(null)
  const leftArmRef = useRef<THREE.Mesh>(null)
  const rightArmRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.PointLight>(null)

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // Subtle head movement
    if (headRef.current) {
      headRef.current.rotation.y = Math.sin(time * 0.5) * 0.1
      headRef.current.rotation.x = Math.sin(time * 0.3) * 0.05
    }
    
    // Breathing effect on body
    if (bodyRef.current) {
      bodyRef.current.scale.x = 1 + Math.sin(time * 2) * 0.02
      bodyRef.current.scale.z = 1 + Math.sin(time * 2) * 0.02
    }
    
    // Arm idle animation
    if (leftArmRef.current) {
      leftArmRef.current.rotation.z = -0.2 + Math.sin(time * 1.5) * 0.05
    }
    if (rightArmRef.current) {
      rightArmRef.current.rotation.z = 0.2 - Math.sin(time * 1.5) * 0.05
    }
    
    // Pulsing glow
    if (glowRef.current) {
      glowRef.current.intensity = 2 + Math.sin(time * 3) * 0.5
    }
  })

  return (
    <Float speed={1} rotationIntensity={0.1} floatIntensity={0.3}>
      <group position={[0, -0.5, 0]}>
        {/* Ambient glow */}
        <pointLight ref={glowRef} position={[0, 1, 2]} color="#00d4ff" intensity={2} distance={8} />
        
        {/* Head */}
        <mesh ref={headRef} position={[0, 1.8, 0]}>
          <sphereGeometry args={[0.45, 64, 64]} />
          <MeshDistortMaterial
            color="#e0f0ff"
            emissive="#00d4ff"
            emissiveIntensity={0.15}
            metalness={0.3}
            roughness={0.4}
            distort={0.1}
            speed={2}
          />
        </mesh>
        
        {/* Face features - eyes */}
        <mesh position={[-0.15, 1.85, 0.38]}>
          <sphereGeometry args={[0.06, 32, 32]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={2} />
        </mesh>
        <mesh position={[0.15, 1.85, 0.38]}>
          <sphereGeometry args={[0.06, 32, 32]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={2} />
        </mesh>
        
        {/* Neck */}
        <mesh position={[0, 1.2, 0]}>
          <cylinderGeometry args={[0.12, 0.15, 0.3, 32]} />
          <meshStandardMaterial color="#8090a0" metalness={0.6} roughness={0.3} />
        </mesh>
        
        {/* Torso */}
        <mesh ref={bodyRef} position={[0, 0.5, 0]}>
          <capsuleGeometry args={[0.4, 1, 16, 32]} />
          <MeshDistortMaterial
            color="#2040a0"
            emissive="#0066ff"
            emissiveIntensity={0.2}
            metalness={0.7}
            roughness={0.3}
            distort={0.05}
            speed={1}
          />
        </mesh>
        
        {/* Chest detail */}
        <mesh position={[0, 0.7, 0.35]}>
          <boxGeometry args={[0.3, 0.15, 0.1]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={0.8} />
        </mesh>
        
        {/* Shoulders */}
        <mesh position={[-0.55, 1.0, 0]}>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshStandardMaterial color="#3050b0" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.55, 1.0, 0]}>
          <sphereGeometry args={[0.15, 32, 32]} />
          <meshStandardMaterial color="#3050b0" metalness={0.7} roughness={0.3} />
        </mesh>
        
        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.55, 1.0, 0]}>
          <mesh position={[0, -0.4, 0]} rotation={[0, 0, -0.2]}>
            <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
            <meshStandardMaterial color="#3050b0" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
        
        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.55, 1.0, 0]}>
          <mesh position={[0, -0.4, 0]} rotation={[0, 0, 0.2]}>
            <capsuleGeometry args={[0.1, 0.5, 8, 16]} />
            <meshStandardMaterial color="#3050b0" metalness={0.6} roughness={0.3} />
          </mesh>
        </group>
        
        {/* Energy rings around body */}
        <mesh position={[0, 0.8, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.6, 0.02, 16, 100]} />
          <meshStandardMaterial color="#00d4ff" emissive="#00d4ff" emissiveIntensity={1} transparent opacity={0.6} />
        </mesh>
        <mesh position={[0, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55, 0.015, 16, 100]} />
          <meshStandardMaterial color="#00ffaa" emissive="#00ffaa" emissiveIntensity={1} transparent opacity={0.4} />
        </mesh>
      </group>
    </Float>
  )
}

export function Avatar3D() {
  return (
    <Canvas
      camera={{ position: [0, 0.5, 4], fov: 45 }}
      className="w-full h-full"
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#0a0a12"]} />
      <fog attach="fog" args={["#0a0a12", 5, 15]} />
      
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <directionalLight position={[-5, 3, -5]} intensity={0.4} color="#0066ff" />
      
      <HumanoidAvatar />
      
      <Environment preset="night" />
    </Canvas>
  )
}
