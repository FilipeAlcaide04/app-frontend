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
    scene.background = new THREE.Color(0x000000)
    scene.fog = new THREE.Fog(0x000000, 0, 100)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.01,
      20
    )
    camera.position.set(0, 1.2, 1.5)
    camera.lookAt(0, 1, 0)

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    containerRef.current.appendChild(renderer.domElement)
    rendererRef.current = renderer

    // Lighting
    const light = new THREE.DirectionalLight(0xffffff, 1.5)
    light.position.set(0, 2, 1)
    scene.add(light)

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8)
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
            sceneRef.current?.add(vrm.scene)
            console.log("VRM added to scene")

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
