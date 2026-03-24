"use client"

import { useEffect, useRef } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { VRMLoaderPlugin } from "@pixiv/three-vrm"
import * as THREE from "three"

export interface VRMAvatarProps {
  avatarUrl?: string
  onAvatarLoaded?: (vrm: any) => void
  onLipSyncStart?: () => void
  onLipSyncEnd?: () => void
}

function VRMModel({ avatarUrl = "/avatars/placeholder.vrm", onAvatarLoaded }: { avatarUrl: string; onAvatarLoaded?: (vrm: any) => void }) {
  const vrmRef = useRef<any>(null)
  const mixerRef = useRef<any>(null)
  const clockRef = useRef(new THREE.Clock())
  const loadedRef = useRef(false)

  useFrame(() => {
    if (vrmRef.current) {
      const deltaTime = clockRef.current.getDelta()
      vrmRef.current.update(deltaTime)
      if (mixerRef.current) {
        mixerRef.current.update(deltaTime)
      }
    }
  })

  useEffect(() => {
    if (loadedRef.current) return

    const loadVRM = async () => {
      try {
        const loader = new GLTFLoader()
        loader.register((parser) => new VRMLoaderPlugin(parser))

        loader.load(
          avatarUrl,
          (gltf) => {
            const vrm = gltf.userData.vrm
            if (!vrm) {
              console.error("No VRM data in loaded file")
              return
            }

            vrmRef.current = vrm
            loadedRef.current = true

            // Close arms by rotating the bones
            if (vrm.humanoid) {
              const closeArms = (arm: any) => {
                if (arm) {
                  arm.rotation.z = Math.PI / 3 // Rotate inward
                }
              }
              
              closeArms(vrm.humanoid.getRawBoneNode('leftUpperArm'))
              closeArms(vrm.humanoid.getRawBoneNode('rightUpperArm'))
              closeArms(vrm.humanoid.getRawBoneNode('leftLowerArm'))
              closeArms(vrm.humanoid.getRawBoneNode('rightLowerArm'))
            }

            // Setup animation mixer
            const animations = gltf.animations
            if (animations.length > 0) {
              mixerRef.current = new THREE.AnimationMixer(vrm.scene)
            }

            onAvatarLoaded?.(vrm)
            console.log("VRM loaded successfully")
            console.log("Available animations:", gltf.animations.map((a: any) => a.name))
          },
          (progress) => {
            console.log("Loading progress:", ((progress.loaded / progress.total) * 100).toFixed(0) + "%")
          },
          (error) => {
            console.error("Error loading VRM file:", error)
          }
        )
      } catch (error) {
        console.error("Error loading VRM:", error)
      }
    }

    loadVRM()
  }, [avatarUrl, onAvatarLoaded])

  return vrmRef.current ? <primitive object={vrmRef.current.scene} scale={1.2} position={[0, -1.3, 0]} /> : null
}

export function VRMAvatar({ avatarUrl = "/avatars/placeholder.vrm", onAvatarLoaded }: VRMAvatarProps) {
  return (
    <Canvas
      camera={{ position: [0, -1, 1.2], fov: 50 }}
      className="w-full h-full"
      gl={{ antialias: true, alpha: true }}
    >
      <fog attach="fog" args={["#0a0a12", 1, 10]} />

      <ambientLight intensity={0.6} />
      <hemisphereLight intensity={0.5} color="#ffd4d4" groundColor="#0a0a12" />
      <directionalLight position={[4, 5, 5]} intensity={1.2} color="#fff0ef" />
      <directionalLight position={[-5, 2, -4]} intensity={0.5} color="#86a6ff" />
      <pointLight position={[0, 2, 2]} intensity={0.6} color="#ffdede" distance={8} />

      <VRMModel avatarUrl={avatarUrl} onAvatarLoaded={onAvatarLoaded} />

      <Environment preset="studio" />

      <OrbitControls
        enablePan={false}
        enableZoom={true}
        enableRotate={true}
        minDistance={1}
        maxDistance={4}
        autoRotate={false}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  )
}

/**
 * Hook para controlar lip-sync do VRM
 */
export function useVRMLipSync(vrm: any) {
  const isSpeakingRef = useRef(false)

  const speak = async (text: string) => {
    if (!vrm?.expressionManager || isSpeakingRef.current) return

    isSpeakingRef.current = true
    const events = generateLipSyncFromText(text)

    try {
      await applyLipSyncSequence(vrm, events, () => {
        isSpeakingRef.current = false
      })
    } catch (error) {
      console.error("Error during lip-sync:", error)
      isSpeakingRef.current = false
    }
  }

  const setExpression = (expression: string, value: number) => {
    if (!vrm?.expressionManager) return
    vrm.expressionManager.setValue(expression, value)
  }

  return { speak, setExpression }
}
