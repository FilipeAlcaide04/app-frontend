import { VRM } from "@pixiv/three-vrm"
import { AnimationClip, AnimationMixer, LoopRepeat, LoopOnce } from "three"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader"

// Available animations - Direct FBX files from Mixamo
// Download from https://www.mixamo.com/ and save in /public/animations/
export const OPENSOURCEAVATARS_ANIMATIONS = [
  { name: "Placeholder", url: "/animations/placeholder.fbx", description: "Placeholder animation", category: "idle", mixamoName: "Any" },
  { name: "T-Pose", url: "/animations/T-Pose.fbx", description: "Default T-Pose", category: "idle", mixamoName: "T-Pose" },
  { name: "Bored", url: "/animations/Bored.fbx", description: "Bored idle animation", category: "idle", mixamoName: "Bored" },
  { name: "Cross Jumps", url: "/animations/Cross-Jumps.fbx", description: "Energetic cross jumps", category: "active", mixamoName: "Jumping Jacks" },
  { name: "Fight Idle", url: "/animations/Fight-Idle.fbx", description: "Combat ready stance", category: "idle", mixamoName: "Fighting Idle" },
  { name: "Jumping Rope", url: "/animations/Jumping-Rope.fbx", description: "Jump rope animation", category: "active", mixamoName: "Jumping Rope" },
  { name: "Looking", url: "/animations/Looking.fbx", description: "Looking animation", category: "idle", mixamoName: "Looking" },
  { name: "Looking Around", url: "/animations/Looking-Around.fbx", description: "Looking around curiously", category: "idle", mixamoName: "Looking Around" },
  { name: "Magic Spell Casting", url: "/animations/Magic-Spell-Casting.fbx", description: "Casting magic spell", category: "active", mixamoName: "Casting Spell 01" },
  { name: "Offensive Idle", url: "/animations/Offensive-Idle.fbx", description: "Aggressive idle stance", category: "idle", mixamoName: "Offensive Idle" },
  { name: "Searching Files High", url: "/animations/Searching-Files-High.fbx", description: "Searching through files", category: "active", mixamoName: "Searching" },
  { name: "Standing Magic Attack", url: "/animations/Standing-Magic-Attack.fbx", description: "Magic attack animation", category: "active", mixamoName: "Standing Melee Attack" },
  { name: "Texting While Standing", url: "/animations/Texting-While-Standing.fbx", description: "Texting on phone", category: "idle", mixamoName: "Texting" },
] as const

export type AnimationName = typeof OPENSOURCEAVATARS_ANIMATIONS[number]["name"]

// Fallback: Built-in simple idle animation
export const FALLBACK_IDLE_ANIMATION = {
  name: "Simple Idle",
  description: "Built-in breathing animation",
}

// Loader for VRM-compatible animations
export class VRMAnimationLoader {
  private gltfLoader: GLTFLoader
  private fbxLoader: FBXLoader
  private animationCache: Map<string, AnimationClip> = new Map()

  constructor() {
    this.gltfLoader = new GLTFLoader()
    this.fbxLoader = new FBXLoader()
  }

  /**
   * Load animation from URL (supports both GLB and FBX)
   */
  async loadAnimation(url: string, animationName: string): Promise<AnimationClip | null> {
    // Check cache first
    const cacheKey = `${animationName}-${url}`
    if (this.animationCache.has(cacheKey)) {
      console.log(`✅ Using cached animation: ${animationName}`)
      return this.animationCache.get(cacheKey)!
    }

    try {
      console.log(`📥 Loading animation: ${animationName} from ${url}`)
      
      // Determine loader based on file extension
      const isFBX = url.toLowerCase().endsWith('.fbx')
      const isGLB = url.toLowerCase().endsWith('.glb') || url.toLowerCase().endsWith('.gltf')

      if (isFBX) {
        return await this.loadFBXAnimation(url, cacheKey, animationName)
      } else if (isGLB) {
        return await this.loadGLBAnimation(url, cacheKey)
      } else {
        console.error(`❌ Unsupported animation format: ${url}`)
        return null
      }
    } catch (error) {
      console.error(`❌ Failed to load animation ${animationName}:`, error)
      return null
    }
  }

  /**
   * Load GLB/GLTF animation
   */
  private async loadGLBAnimation(url: string, cacheKey: string): Promise<AnimationClip | null> {
    return new Promise((resolve) => {
      this.gltfLoader.load(
        url,
        (gltf) => {
          if (gltf.animations && gltf.animations.length > 0) {
            const clip = gltf.animations[0]
            this.animationCache.set(cacheKey, clip)
            console.log(`Successfully loaded GLB animation: ${clip.name}`)
            resolve(clip)
          } else {
            console.warn(`No animations found in GLB: ${url}`)
            resolve(null)
          }
        },
        undefined,
        (error) => {
          console.error(`Error loading GLB animation:`, error)
          resolve(null)
        }
      )
    })
  }

  /**
   * Load FBX animation (Mixamo format)
   */
  private async loadFBXAnimation(url: string, cacheKey: string, animationName: string): Promise<AnimationClip | null> {
    return new Promise((resolve) => {
      this.fbxLoader.load(
        url,
        (fbx) => {
          if (fbx.animations && fbx.animations.length > 0) {
            const clip = fbx.animations[0]
            // Rename the clip to the animation name for easier identification
            clip.name = animationName
            this.animationCache.set(cacheKey, clip)
            console.log(`✅ Successfully loaded FBX animation: ${animationName} (${clip.tracks.length} tracks, ${clip.duration.toFixed(2)}s)`)
            resolve(clip)
          } else {
            console.warn(`⚠️  No animations found in FBX: ${url}`)
            resolve(null)
          }
        },
        (progress) => {
          if (progress.total > 0) {
            const percent = Math.round((progress.loaded / progress.total) * 100)
            if (percent % 25 === 0) { // Log every 25%
              console.log(`📊 Loading ${animationName}: ${percent}%`)
            }
          }
        },
        (error) => {
          console.error(`❌ Error loading FBX animation from ${url}:`, error)
          console.log(`💡 Make sure the file exists at: public${url}`)
          resolve(null)
        }
      )
    })
  }

  /**
   * Load animation from local GLB file
   */
  async loadLocalAnimation(path: string): Promise<AnimationClip[]> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          if (gltf.animations && gltf.animations.length > 0) {
            console.log(`Loaded ${gltf.animations.length} animations from ${path}`)
            gltf.animations.forEach((clip) => {
              this.animationCache.set(clip.name, clip)
            })
            resolve(gltf.animations)
          } else {
            console.warn(`No animations found in ${path}`)
            resolve([])
          }
        },
        undefined,
        (error) => {
          console.error(`Error loading animation from ${path}:`, error)
          reject(error)
        }
      )
    })
  }

  /**
   * Apply animation to VRM model
   */
  applyAnimation(
    vrm: VRM,
    animationClip: AnimationClip,
    mixer: AnimationMixer,
    loop = true
  ) {
    if (!vrm || !animationClip || !mixer) {
      console.error("Missing required parameters for applyAnimation")
      return null
    }

    // Stop all current actions
    mixer.stopAllAction()

    // Create and play the new action
    const action = mixer.clipAction(animationClip)
    action.reset()
    action.setLoop(loop ? LoopRepeat : LoopOnce, Infinity)
    action.fadeIn(0.5) // Smooth transition
    action.play()

    console.log(`🎬 Playing animation: ${animationClip.name} (${animationClip.duration.toFixed(2)}s)`)
    return action
  }

  /**
   * Get cached animation
   */
  getCachedAnimation(name: string): AnimationClip | undefined {
    return this.animationCache.get(name)
  }

  /**
   * Clear animation cache
   */
  clearCache() {
    this.animationCache.clear()
  }
}

// Helper function to create animation loader instance
let animationLoaderInstance: VRMAnimationLoader | null = null

export function getAnimationLoader(): VRMAnimationLoader {
  if (!animationLoaderInstance) {
    animationLoaderInstance = new VRMAnimationLoader()
  }
  return animationLoaderInstance
}

// Preset animations with closed arms (suitable for idle)
export const IDLE_ANIMATIONS: AnimationName[] = [
  "Bored",
  "Offensive Idle",
  "Standing Magic Attack",
  "Looking Around",
  "Texting While Standing",
]

// Active animations
export const ACTIVE_ANIMATIONS: AnimationName[] = [
  "Cross Jumps",
  "Fight Idle",
  "Jumping Rope",
  "Magic Spell Casting",
  "Searching Files High",
]
