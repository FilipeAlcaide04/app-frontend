"use client"

import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Html, useGLTF } from "@react-three/drei"
import * as THREE from "three"
import type { ThoughtContribution } from "@/lib/agents"

class BrainErrorBoundary extends Component<
  { children: ReactNode; onRetry: () => void },
  { hasError: boolean }
> {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.warn("[Brain3D] Render error, will auto-retry:", error.message)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-card/60 border border-border/50 flex items-center justify-center text-xl">
              🧠
            </div>
            <p className="text-muted-foreground text-sm mb-2">Erro ao carregar cérebro</p>
            <button
              onClick={() => {
                this.setState({ hasError: false })
                this.props.onRetry()
              }}
              className="text-xs text-primary hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}

interface BrainRegion {
  name: string
  agentType: string
  description: string
  color: string
  position: [number, number, number]
  radius: number
}

const regions: BrainRegion[] = [
  {
    name: "Agente Lógico",
    agentType: "logical",
    description: "Raciocínio causal, dedução e tomada de decisão racional",
    color: "#00f7ff",
    position: [0.0, 0.62, 0.58],
    radius: 0.74,
  },
  {
    name: "Agente Crítico",
    agentType: "critical",
    description: "Ceticismo, deteção de ameaças e avaliação de inconsistências",
    color: "#ff1455",
    position: [0.0, 0.88, 0.1],
    radius: 0.68,
  },
  {
    name: "Agente Emocional",
    agentType: "emotional",
    description: "Reação visceral, sentimento somático e leitura emocional",
    color: "#ff35ff",
    position: [-0.26, -0.12, 0.35],
    radius: 0.52,
  },
  {
    name: "Agente Criativo",
    agentType: "creative",
    description: "Associação livre, metáforas e pensamento divergente",
    color: "#fff000",
    position: [0.26, -0.1, 0.35],
    radius: 0.52,
  },
  {
    name: "Agente Curador de Memórias",
    agentType: "memory_curator",
    description: "Decide o que armazenar, categoriza e preserva memórias importantes",
    color: "#00ff95",
    position: [-0.4, -0.45, 0.12],
    radius: 0.54,
  },
  {
    name: "Agente Social",
    agentType: "social",
    description: "Leitura de dinâmicas relacionais, teoria da mente e empatia",
    color: "#ff7300",
    position: [0.6, 0.05, 0.15],
    radius: 0.56,
  },
  {
    name: "Agente Ético",
    agentType: "ethical",
    description: "Julgamento moral, alinhamento com valores e limites éticos",
    color: "#bf00ff",
    position: [-0.62, 0.05, 0.16],
    radius: 0.56,
  },
  {
    name: "Agente Imaginação",
    agentType: "imagination",
    description: "Inventa memórias coerentes e expande o conhecimento da persona",
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
uniform float uActiveFlags[8];
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

  float edgeBand = 0.07;
  float edgeDelta = secondD - nearestD;
  float edgeMix = 1.0 - smoothstep(0.0, edgeBand, edgeDelta);
  vec3 hardColor = uColors[nearestI];
  vec3 neighborColor = uColors[secondI];
  vec3 blended = mix(hardColor, neighborColor, edgeMix * 0.5);

  vec3 colorOut = pow(blended, vec3(1.04)) * 0.9;
  colorOut = clamp(colorOut, 0.0, 1.0);

  float coverage = smoothstep(1.35, 0.82, nearestD);
  vec3 baseTint = vec3(0.86, 0.82, 0.87);
  colorOut = mix(baseTint, colorOut, coverage);

  float isActive = uActiveFlags[nearestI];
  float pulseSpeed = mix(2.0, 4.5, isActive);
  float pulseMin = mix(0.88, 0.72, isActive);
  float pulseRange = mix(0.12, 0.28, isActive);
  float pulse = pulseMin + pulseRange * sin(uTime * pulseSpeed + float(nearestI));

  float alphaBase = mix(0.28, 0.52, coverage);
  float alphaBoost = mix(0.0, 0.18, isActive);
  float alpha = (alphaBase + alphaBoost) * pulse;
  alpha = clamp(alpha, 0.20, 0.72);

  gl_FragColor = vec4(colorOut, alpha);
}
`

interface RealisticBrainProps {
  thoughts?: ThoughtContribution[]
}

function RealisticBrain({ thoughts }: RealisticBrainProps) {
  const brainRef = useRef<THREE.Group>(null)
  const [hoveredRegionIndex, setHoveredRegionIndex] = useState<number | null>(null)
  const [pinnedRegionIndex, setPinnedRegionIndex] = useState<number | null>(null)
  const [expanded, setExpanded] = useState(false)
  const hoveredRegionRef = useRef<number | null>(null)
  const outTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const switchCandidateRef = useRef<{ index: number; since: number } | null>(null)
  const { scene } = useGLTF("/models/brain.glb")

  const thoughtMap = useMemo(() => {
    const map: Record<string, ThoughtContribution> = {}
    if (thoughts) {
      for (const t of thoughts) {
        map[t.agent_type] = t
      }
    }
    return map
  }, [thoughts])

  const activeRegionIndex = pinnedRegionIndex ?? hoveredRegionIndex
  const activeRegion = activeRegionIndex !== null ? regions[activeRegionIndex] : null
  const activeThought = activeRegion ? thoughtMap[activeRegion.agentType] : null
  const isPinned = pinnedRegionIndex !== null

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
      uActiveFlags: { value: new Float32Array(8) },
    }
  }, [])

  useEffect(() => {
    const flags = new Float32Array(8)
    for (let i = 0; i < regions.length; i++) {
      flags[i] = thoughtMap[regions[i].agentType] ? 1.0 : 0.0
    }
    overlayUniforms.uActiveFlags.value = flags
  }, [thoughtMap, overlayUniforms])

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
          onClick={(event) => {
            event.stopPropagation()
            const localPoint = event.object.worldToLocal(event.point.clone())
            const nearest = getNearestRegionIndex(localPoint)
            if (nearest) {
              if (pinnedRegionIndex === nearest.index) {
                setPinnedRegionIndex(null)
                setExpanded(false)
              } else {
                setPinnedRegionIndex(nearest.index)
                setExpanded(false)
              }
            } else {
              setPinnedRegionIndex(null)
              setExpanded(false)
            }
          }}
          onPointerOut={() => {
            if (outTimerRef.current) {
              clearTimeout(outTimerRef.current)
            }

            switchCandidateRef.current = null

            if (pinnedRegionIndex === null) {
              outTimerRef.current = setTimeout(() => {
                setHoveredRegionIndex(null)
                outTimerRef.current = null
              }, 160)
            }
          }}
        >
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {activeRegion && (
          <Html
            position={[
              activeRegion.position[0],
              activeRegion.position[1] + 0.2,
              activeRegion.position[2],
            ]}
            center
            zIndexRange={[50, 0]}
          >
            <div
              className={`select-none bg-card/95 backdrop-blur-sm border rounded-md shadow-xl transition-all ${
                isPinned
                  ? "pointer-events-auto cursor-default border-border min-w-[200px] max-w-[340px] px-3 py-2.5"
                  : "pointer-events-none border-border/60 min-w-[clamp(160px,20vw,220px)] max-w-[clamp(200px,28vw,300px)] px-2.5 py-2"
              }`}
              style={isPinned ? { borderColor: activeRegion.color + "40" } : undefined}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-foreground font-semibold text-[clamp(10px,0.9vw,12px)] leading-tight">{activeRegion.name}</p>
                <div className="flex items-center gap-1.5">
                  {activeThought && (
                    <span
                      className="text-[clamp(8px,0.7vw,10px)] font-mono px-1.5 py-0.5 rounded-full border"
                      style={{ color: activeRegion.color, borderColor: activeRegion.color + "60" }}
                    >
                      {Math.round(activeThought.confidence * 100)}%
                    </span>
                  )}
                  {isPinned && (
                    <button
                      className="text-muted-foreground hover:text-foreground text-xs leading-none px-1"
                      onClick={(e) => {
                        e.stopPropagation()
                        setPinnedRegionIndex(null)
                        setExpanded(false)
                      }}
                      title="Fechar"
                    >
                      ✕
                    </button>
                  )}
                </div>
              </div>

              {activeThought ? (
                <>
                  <p className="text-[clamp(9px,0.8vw,11px)] font-semibold mt-1" style={{ color: activeRegion.color }}>
                    Pensamento:
                  </p>
                  <p className={`text-muted-foreground text-[clamp(8px,0.72vw,10px)] mt-0.5 leading-snug ${
                    expanded ? "" : "line-clamp-4"
                  }`}>
                    {activeThought.perspective}
                  </p>
                  {isPinned && activeThought.perspective.length > 150 && (
                    <button
                      className="text-[clamp(8px,0.7vw,10px)] mt-1 hover:underline"
                      style={{ color: activeRegion.color }}
                      onClick={(e) => {
                        e.stopPropagation()
                        setExpanded(!expanded)
                      }}
                    >
                      {expanded ? "Ver menos" : "Ver tudo"}
                    </button>
                  )}
                  <div className="flex items-center gap-2 mt-1.5 pt-1 border-t border-border/40">
                    <span className="text-[clamp(7px,0.65vw,9px)] text-muted-foreground">
                      Peso: {activeThought.weight.toFixed(2)}x
                    </span>
                    {!isPinned && activeThought.perspective.length > 100 && (
                      <span className="text-[clamp(7px,0.65vw,9px)] text-muted-foreground/50 italic ml-auto">
                        clica para expandir
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-[clamp(9px,0.8vw,11px)] font-semibold mt-0.5" style={{ color: activeRegion.color }}>
                    Inativo
                  </p>
                  <p className="text-muted-foreground text-[clamp(8px,0.72vw,10px)] mt-1 leading-snug">
                    {activeRegion.description}
                  </p>
                  <p className="text-muted-foreground/60 text-[clamp(7px,0.65vw,9px)] mt-1 italic">
                    Este agente não participou na última resposta
                  </p>
                </>
              )}
            </div>
          </Html>
        )}
      </group>
    </group>
  )
}

export interface Brain3DProps {
  thoughts?: ThoughtContribution[]
}

export function Brain3D({ thoughts }: Brain3DProps) {
  const [retryKey, setRetryKey] = useState(0)

  return (
    <BrainErrorBoundary onRetry={() => setRetryKey((k) => k + 1)}>
      <Canvas
        key={retryKey}
        camera={{ position: [0, 0, 5], fov: 50 }}
        className="w-full h-full"
        gl={{ antialias: true, alpha: true }}
        onCreated={({ gl }) => {
          gl.getContext().canvas.addEventListener("webglcontextlost", (e) => {
            e.preventDefault()
            console.warn("[Brain3D] WebGL context lost, triggering retry")
            setRetryKey((k) => k + 1)
          })
        }}
      >
        <fog attach="fog" args={["#0a0a12", 5.5, 13]} />

        <ambientLight intensity={0.48} />
        <hemisphereLight intensity={0.38} color="#ffd4d4" groundColor="#0a0a12" />
        <directionalLight position={[4, 5, 5]} intensity={0.95} color="#fff0ef" />
        <directionalLight position={[-5, 2, -4]} intensity={0.34} color="#86a6ff" />
        <pointLight position={[0, 2, 2]} intensity={0.52} color="#ffdede" distance={8} />

        <RealisticBrain thoughts={thoughts} />

        <OrbitControls
          enablePan={false}
          enableZoom={true}
          minDistance={3}
          maxDistance={8}
          autoRotate={false}
        />
      </Canvas>
    </BrainErrorBoundary>
  )
}

useGLTF.preload("/models/brain.glb")
