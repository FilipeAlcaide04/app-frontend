"use client"

import { useEffect, useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Environment } from "@react-three/drei"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader"
import { VRMLoaderPlugin } from "@pixiv/three-vrm"
import * as THREE from "three"
import { getAnimationLoader, OPENSOURCEAVATARS_ANIMATIONS, type AnimationName } from "@/lib/vrm-animations"
import { generateLipSyncFromText, applyLipSyncSequence } from "@/lib/lip-sync"

export interface VRMAvatarProps {
  avatarUrl?: string
  animationName?: AnimationName | string
  onAvatarLoaded?: (vrm: any) => void
  onLipSyncStart?: () => void
  onLipSyncEnd?: () => void
  autoRotate?: boolean
}

function AvatarModel({ 
  avatarUrl = "/avatars/placeholder.vrm", 
  animationName,
  onAvatarLoaded 
}: { 
  avatarUrl: string
  animationName?: AnimationName | string
  onAvatarLoaded?: (vrm: any) => void 
}) {
  const modelRef = useRef<any>(null)
  const vrmRef = useRef<any>(null)
  const mixerRef = useRef<THREE.AnimationMixer | null>(null)
  const actionRef = useRef<THREE.AnimationAction | null>(null)
  const loadedRef = useRef(false)
  const [availableAnimations, setAvailableAnimations] = useState<THREE.AnimationClip[]>([])
  const [modelType, setModelType] = useState<'vrm' | 'fbx' | null>(null)

  useFrame((state, delta) => {
    if (vrmRef.current) {
      vrmRef.current.update(delta)
    }
    if (mixerRef.current) {
      mixerRef.current.update(delta)
    }
  })

  // Load avatar (VRM or FBX)
  useEffect(() => {
    if (loadedRef.current) return

    const loadAvatar = async () => {
      const isFBX = avatarUrl.toLowerCase().endsWith('.fbx')
      const isVRM = avatarUrl.toLowerCase().endsWith('.vrm')

      console.log(`🎭 Loading avatar from: ${avatarUrl}`)
      console.log(`   Format: ${isFBX ? 'FBX' : isVRM ? 'VRM' : 'Unknown'}`)

      try {
        if (isFBX) {
          await loadFBXAvatar(avatarUrl)
        } else if (isVRM) {
          await loadVRMAvatar(avatarUrl)
        } else {
          console.error('❌ Unsupported avatar format. Use .fbx or .vrm')
        }
      } catch (error) {
        console.error('❌ Error loading avatar:', error)
      }
    }

    const loadFBXAvatar = async (url: string) => {
      const loader = new FBXLoader()
      
      loader.load(
        url,
        (fbx) => {
          console.log(`✅ FBX avatar loaded successfully!`)
          console.log(`   - Children: ${fbx.children.length}`)
          console.log(`   - Type: ${fbx.type}`)
          
          // Store model reference
          modelRef.current = fbx
          setModelType('fbx')
          loadedRef.current = true

          // Setup animation mixer
          mixerRef.current = new THREE.AnimationMixer(fbx)
          console.log(`✅ Animation mixer created for FBX`)

          // Check for embedded animations
          if (fbx.animations && fbx.animations.length > 0) {
            console.log(`🎬 Found ${fbx.animations.length} embedded animations in FBX:`)
            fbx.animations.forEach((anim, idx) => {
              console.log(`   ${idx + 1}. "${anim.name}" (${anim.duration.toFixed(2)}s, ${anim.tracks.length} tracks)`)
            })
            setAvailableAnimations(fbx.animations)
            
            // Play first animation by default
            const firstAnim = fbx.animations[0]
            const action = mixerRef.current!.clipAction(firstAnim)
            action.play()
            actionRef.current = action
            console.log(`🎬 Auto-playing first animation: "${firstAnim.name}"`)
          } else {
            console.log(`📦 No animations found in FBX - Avatar will be in bind pose`)
          }

          // Fix materials for missing textures
          fbx.traverse((child: any) => {
            if (child.isMesh) {
              // Use basic material if textures are missing
              if (child.material) {
                child.material.side = THREE.DoubleSide
                // If texture is missing, use a default color
                child.material.needsUpdate = true
                console.log(`   - Mesh found: ${child.name || 'unnamed'}`)
              }
            }
          })

          // Scale and position for better viewing
          // Try different scales - FBX can vary
          const box = new THREE.Box3().setFromObject(fbx)
          const size = box.getSize(new THREE.Vector3())
          const maxDim = Math.max(size.x, size.y, size.z)
          const scale = 2 / maxDim // Scale to fit in 2 units
          
          fbx.scale.set(scale, scale, scale)
          
          // Center the model
          const center = box.getCenter(new THREE.Vector3())
          fbx.position.set(-center.x * scale, -center.y * scale - 1, -center.z * scale)
          
          console.log(`📐 Model dimensions: ${size.x.toFixed(2)} x ${size.y.toFixed(2)} x ${size.z.toFixed(2)}`)
          console.log(`📐 Applied scale: ${scale.toFixed(4)}`)
          console.log(`📐 Position: ${fbx.position.x.toFixed(2)}, ${fbx.position.y.toFixed(2)}, ${fbx.position.z.toFixed(2)}`)

          onAvatarLoaded?.(fbx)
          console.log(`✅ FBX avatar setup complete!`)
        },
        (progress) => {
          const percent = progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : 0
          if (percent % 25 === 0 && percent > 0) {
            console.log(`📊 Loading FBX: ${percent}%`)
          }
        },
        (error) => {
          console.error('❌ Error loading FBX avatar:', error)
        }
      )
    }

    const loadVRMAvatar = async (url: string) => {
      const loader = new GLTFLoader()
      loader.register((parser) => new VRMLoaderPlugin(parser))

      loader.load(
        url,
        (gltf) => {
          const vrm = gltf.userData.vrm
          if (!vrm) {
            console.error("❌ No VRM data in loaded file")
            return
          }

          console.log(`✅ VRM avatar loaded successfully!`)
          console.log(`   - Bones: ${vrm.humanoid?.humanBones ? Object.keys(vrm.humanoid.humanBones).length : 0}`)
          console.log(`   - Has expressions: ${vrm.expressionManager ? 'Yes' : 'No'}`)
          
          vrmRef.current = vrm
          modelRef.current = vrm.scene
          setModelType('vrm')
          loadedRef.current = true

          // Setup animation mixer
          mixerRef.current = new THREE.AnimationMixer(vrm.scene)
          console.log(`✅ Animation mixer created for VRM`)

          // Check for embedded animations
          const embeddedAnimations = gltf.animations
          if (embeddedAnimations.length > 0) {
            console.log(`🎬 Found ${embeddedAnimations.length} embedded animations in VRM:`)
            embeddedAnimations.forEach((anim, idx) => {
              console.log(`   ${idx + 1}. ${anim.name}`)
            })
            setAvailableAnimations(embeddedAnimations)
          } else {
            console.log(`📦 No embedded animations in VRM file`)
          }

          onAvatarLoaded?.(vrm)
        },
        (progress) => {
          const percent = progress.total > 0 ? Math.round((progress.loaded / progress.total) * 100) : 0
          if (percent % 25 === 0 && percent > 0) {
            console.log(`📊 Loading VRM: ${percent}%`)
          }
        },
        (error) => {
          console.error("❌ Error loading VRM file:", error)
        }
      )
    }

    loadAvatar()
  }, [avatarUrl, onAvatarLoaded])

  // Handle animation changes
  useEffect(() => {
    if (!mixerRef.current || !modelRef.current) {
      return
    }

    if (!animationName || availableAnimations.length === 0) return

    console.log(`\n🎬 ===== CHANGING ANIMATION: ${animationName} =====`)
    console.log(`   Available animations: ${availableAnimations.map(a => `"${a.name}"`).join(', ')}`)

    // First, check if animation exists in embedded animations
    const embeddedAnim = availableAnimations.find(
      (anim) => anim.name.toLowerCase().includes(animationName.toLowerCase()) ||
                animationName.toLowerCase().includes(anim.name.toLowerCase())
    )

    if (embeddedAnim) {
      console.log(`✅ Found embedded animation: "${embeddedAnim.name}"`)
      console.log(`   - Duration: ${embeddedAnim.duration.toFixed(2)}s`)
      console.log(`   - Tracks: ${embeddedAnim.tracks.length}`)
      
      // Stop current animation
      if (actionRef.current) {
        actionRef.current.fadeOut(0.5)
      }
      
      // Play new animation
      const action = mixerRef.current.clipAction(embeddedAnim)
      action.reset()
      action.fadeIn(0.5)
      action.play()
      actionRef.current = action
      
      console.log(`🎬 Playing embedded animation: "${embeddedAnim.name}"`)
      console.log(`🎬 ===== ANIMATION CHANGE COMPLETE =====\n`)
      return
    }

    // If not found and it's VRM, try external
    if (modelType === 'vrm') {
      console.log(`📥 Animation not found in embedded animations, trying external...`)
      loadExternalAnimation(animationName)
    } else {
      console.warn(`⚠️  Animation "${animationName}" not found in embedded FBX animations`)
      console.log(`💡 Available animations in your FBX:`)
      availableAnimations.forEach((anim, idx) => {
        console.log(`   ${idx + 1}. "${anim.name}"`)
      })
    }

  }, [animationName, availableAnimations, modelType])

  const loadExternalAnimation = async (animName: string) => {
    try {
      const animLoader = getAnimationLoader()
      const animConfig = OPENSOURCEAVATARS_ANIMATIONS.find(
        (anim) => anim.name === animName
      )
      
      if (!animConfig) {
        console.warn(`⚠️  Animation "${animName}" not found in config`)
        return
      }

      console.log(`📁 Loading external animation: ${animConfig.url}`)
      const clip = await animLoader.loadAnimation(animConfig.url, animConfig.name)
      
      if (clip && mixerRef.current) {
        const action = animLoader.applyAnimation(
          vrmRef.current,
          clip,
          mixerRef.current,
          true
        )
        actionRef.current = action
        console.log(`✅ External animation applied!`)
      }
    } catch (error) {
      console.error("❌ Error loading external animation:", error)
    }
  }

  return modelRef.current ? (
    <>
      <primitive 
        object={modelRef.current}
        position={modelRef.current.position}
        scale={modelRef.current.scale}
      />
      {/* Helper to see if model is loaded */}
      {modelRef.current && (
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial color="red" opacity={0.5} transparent />
        </mesh>
      )}
    </>
  ) : (
    // Loading indicator
    <mesh position={[0, 0, 0]}>
      <boxGeometry args={[0.2, 0.2, 0.2]} />
      <meshBasicMaterial color="yellow" />
    </mesh>
  )
}

export function VRMAvatar({ 
  avatarUrl = "/avatars/placeholder.vrm", 
  animationName,
  onAvatarLoaded,
  autoRotate = false
}: VRMAvatarProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 50 }}
      className="w-full h-full"
      gl={{ antialias: true, alpha: true }}
    >
      <color attach="background" args={["#0a0a12"]} />
      <fog attach="fog" args={["#0a0a12", 5, 20]} />

      <ambientLight intensity={0.8} />
      <hemisphereLight intensity={0.6} color="#ffffff" groundColor="#444444" />
      <directionalLight position={[5, 5, 5]} intensity={1} color="#ffffff" castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.5} color="#ffffff" />
      <pointLight position={[0, 2, 2]} intensity={0.5} color="#ffffff" distance={10} />

      <AvatarModel 
        avatarUrl={avatarUrl} 
        animationName={animationName}
        onAvatarLoaded={onAvatarLoaded} 
      />

      <Environment preset="studio" />
      
      {/* Grid helper for debugging */}
      <gridHelper args={[10, 10, 0x888888, 0x444444]} position={[0, -2, 0]} />

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        minDistance={2}
        maxDistance={10}
        autoRotate={autoRotate}
        autoRotateSpeed={1}
        target={[0, 0, 0]}
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
