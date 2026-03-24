"use client"

import { useState, useRef, useEffect } from "react"
import * as THREE from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { VRMLoaderPlugin } from "@pixiv/three-vrm"
import { generateLipSyncFromText, applyLipSyncSequence } from "@/lib/lip-sync"

export interface VRMAvatarProps {
  avatarUrl?: string
  onAvatarLoaded?: (vrm: any) => void
  onLipSyncStart?: () => void
  onLipSyncEnd?: () => void
}

export function VRMAvatar({ avatarUrl = "/avatars/placeholder.vrm", onAvatarLoaded, onLipSyncStart, onLipSyncEnd }: VRMAvatarProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const vrmRef = useRef<any>(null)
  const mixerRef = useRef<any>(null)
  const clockRef = useRef(new THREE.Clock())

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerRef.current) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x1a1a2e) // Slight blue-dark instead of pure black
    scene.fog = new THREE.Fog(0x1a1a2e, 5, 50)
    sceneRef.current = scene

    // Camera - adjusted for better avatar viewing
    const camera = new THREE.PerspectiveCamera(
      75,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.01,
      100
    )
    camera.position.set(0, 1.4, 2.2)
    camera.lookAt(0, 1.2, 0)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Better lighting setup
    // Key light (from upper right)
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.0)
    keyLight.position.set(2, 3, 2)
    scene.add(keyLight)

    // Fill light (from upper left, opposite direction)
    const fillLight = new THREE.DirectionalLight(0x7fbfff, 1.0)
    fillLight.position.set(-2, 2, 1)
    scene.add(fillLight)

    // Ambient light for overall brightness
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2)
    scene.add(ambientLight)

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current) return
      const width = containerRef.current.clientWidth
      const height = containerRef.current.clientHeight
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height)
    }

    window.addEventListener("resize", handleResize)

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate)
      const deltaTime = clockRef.current.getDelta()

      if (vrmRef.current) {
        vrmRef.current.update(deltaTime)
      }

      if (mixerRef.current) {
        mixerRef.current.update(deltaTime)
      }

      renderer.render(scene, camera)
    }

    animate()

    return () => {
      window.removeEventListener("resize", handleResize)
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [])

  // Load VRM avatar
  useEffect(() => {
    console.log("VRM Avatar useEffect triggered:", { avatarUrl, sceneRef: !!sceneRef.current })
    
    if (!avatarUrl || !sceneRef.current) {
      console.log("Skipping VRM load:", { avatarUrl, sceneRef: !!sceneRef.current })
      return
    }

    const loadVRM = async () => {
      try {
        console.log("Loading VRM from:", avatarUrl)
        const loader = new GLTFLoader()
        loader.register((parser) => new VRMLoaderPlugin(parser))

        loader.load(
          avatarUrl,
          (gltf) => {
            console.log("VRM loaded successfully:", gltf)
            const vrm = gltf.userData.vrm

            if (!vrm) {
              console.error("No VRM data in loaded file")
              return
            }

            // Remove old VRM if exists
            if (vrmRef.current) {
              sceneRef.current?.remove(vrmRef.current.scene)
            }

            vrmRef.current = vrm
            
            // Scale and position the VRM avatar
            vrm.scene.scale.set(1.2, 1.2, 1.2)
            vrm.scene.position.set(0, 0, 0)
            
            sceneRef.current?.add(vrm.scene)
            console.log("VRM added to scene with scale:", vrm.scene.scale)

            // Setup animation mixer if needed
            const animations = gltf.animations
            if (animations.length > 0 && !mixerRef.current) {
              mixerRef.current = new THREE.AnimationMixer(vrm.scene)
            }

            onAvatarLoaded?.(vrm)
          },
          (progress) => {
            console.log("Loading progress:", (progress.loaded / progress.total) * 100 + "%")
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

  return (
    <div ref={containerRef} className="w-full h-full" />
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
