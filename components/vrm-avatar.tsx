"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";
import * as THREE from "three";

/* =========================
   AVATAR COMPONENT
========================= */

export interface VRMAvatarProps {
  avatarUrl?: string;
  onAvatarLoaded?: (vrm: any) => void;
  onError?: (error: Error) => void;
}

export function VRMAvatar({
  avatarUrl = "/avatars/placeholder.vrm",
  onAvatarLoaded,
  onError,
}: VRMAvatarProps) {
  const [canvasKey, setCanvasKey] = useState(0);

  return (
    <Canvas
      key={canvasKey}
      camera={{ position: [0, 1.2, 2], fov: 20 }}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      onCreated={({ gl }) => {
        const canvas = gl.domElement;
        canvas.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
          setTimeout(() => setCanvasKey((k) => k + 1), 100);
        });
      }}
    >
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 5]} intensity={1.2} />
      <pointLight position={[0, 2, 2]} intensity={0.6} />

      <VRMModel avatarUrl={avatarUrl} onAvatarLoaded={onAvatarLoaded} onError={onError} />

      <Environment preset="studio" />

      <OrbitControls
        enablePan={false}
        minDistance={1.5}
        maxDistance={3}
        minPolarAngle={Math.PI / 2}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
}

/* =========================
   VRM MODEL
========================= */

function VRMModel({
  avatarUrl,
  onAvatarLoaded,
  onError,
}: {
  avatarUrl: string;
  onAvatarLoaded?: (vrm: any) => void;
  onError?: (error: Error) => void;
}) {
  const [vrm, setVrm] = useState<any>(null);
  const [hasError, setHasError] = useState(false);
  const onAvatarLoadedRef = useRef(onAvatarLoaded);
  const onErrorRef = useRef(onError);
  onAvatarLoadedRef.current = onAvatarLoaded;
  onErrorRef.current = onError;

  useEffect(() => {
    let isMounted = true;
    setVrm(null);
    setHasError(false);

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      avatarUrl,
      (gltf) => {
        if (!isMounted) return;

        const loadedVrm = gltf.userData.vrm;
        if (!loadedVrm) {
          const error = new Error("Avatar VRM inválido");
          setHasError(true);
          console.error("❌ No VRM");
          onErrorRef.current?.(error);
          return;
        }

        loadedVrm.scene.rotation.y = Math.PI;

        setVrm(loadedVrm);
        onAvatarLoadedRef.current?.(loadedVrm);

        console.log("✅ VRM READY");
      },
      undefined,
      (err) => {
        if (!isMounted) return;
        const error = err instanceof Error ? err : new Error("Erro ao carregar avatar VRM");
        setHasError(true);
        console.error(error);
        onErrorRef.current?.(error);
      },
    );

    return () => {
      isMounted = false;
    };
  }, [avatarUrl]);

  useFrame((_, delta) => {
    if (!vrm) return;

    vrm.update(delta);

    const humanoid = vrm.humanoid;
    if (!humanoid) return;

    const lShoulder = humanoid.getNormalizedBoneNode("leftShoulder");
    const rShoulder = humanoid.getNormalizedBoneNode("rightShoulder");

    const lU = humanoid.getNormalizedBoneNode("leftUpperArm");
    const rU = humanoid.getNormalizedBoneNode("rightUpperArm");

    const lL = humanoid.getNormalizedBoneNode("leftLowerArm");
    const rL = humanoid.getNormalizedBoneNode("rightLowerArm");

    if (lShoulder && rShoulder && lU && rU && lL && rL) {
      // 🧠 1. OMBROS (muito importante)
      lShoulder.rotation.z = Math.PI / 8;
      rShoulder.rotation.z = -Math.PI /8;

      lShoulder.rotation.x = -0.3;
      rShoulder.rotation.x = -0.3;

      // 💪 2. BRAÇOS (agora fica natural)
      lU.rotation.x = 1;
      rU.rotation.x = 1;

      lU.rotation.z = Math.PI / 6;
      rU.rotation.z = -Math.PI / 6;

      // 🔄 pequeno ajuste
      lU.rotation.y = 0.2;
      rU.rotation.y = -0.2;
 

      // 🤏 3. ANTEBRAÇO
      lL.rotation.x = -0.6;
      rL.rotation.x = -0.6;
      rL.rotation.z = -0.6;
      lL.rotation.z = 0.6;
    }

    // blink - handled externally by useVRMBlink
  });

  if (!vrm) {
    return (
      <mesh position={[0, 0.1, 0]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color={hasError ? "#dc2626" : "#60a5fa"}
          emissive={hasError ? "#7f1d1d" : "#1d4ed8"}
          emissiveIntensity={0.6}
        />
      </mesh>
    );
  }

  return <primitive object={vrm.scene} scale={1.2} position={[0, -1.5, 0]} />;
}

/* =========================
   NATURAL BLINK HOOK
========================= */

export function useVRMBlink(vrm: any, isSpeaking: boolean) {
  const blinkTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!vrm?.expressionManager) return;

    let blinkValue = 0;
    let blinkPhase: "idle" | "closing" | "closed" | "opening" = "idle";
    let phaseStart = 0;

    const CLOSE_DURATION = 60;
    const CLOSED_DURATION = 40;
    const OPEN_DURATION = 80;

    function getNextBlinkDelay() {
      const base = isSpeaking ? 2500 : 4000;
      const variance = isSpeaking ? 1500 : 2500;
      return base + Math.random() * variance;
    }

    function triggerBlink() {
      blinkPhase = "closing";
      phaseStart = performance.now();
    }

    function scheduleBlink() {
      blinkTimerRef.current = setTimeout(() => {
        triggerBlink();
        if (Math.random() < 0.2) {
          setTimeout(triggerBlink, 200);
        }
        scheduleBlink();
      }, getNextBlinkDelay());
    }

    function animate() {
      const now = performance.now();
      const elapsed = now - phaseStart;

      if (blinkPhase === "closing") {
        blinkValue = Math.min(1, elapsed / CLOSE_DURATION);
        if (elapsed >= CLOSE_DURATION) {
          blinkPhase = "closed";
          phaseStart = now;
        }
      } else if (blinkPhase === "closed") {
        blinkValue = 1;
        if (elapsed >= CLOSED_DURATION) {
          blinkPhase = "opening";
          phaseStart = now;
        }
      } else if (blinkPhase === "opening") {
        blinkValue = Math.max(0, 1 - elapsed / OPEN_DURATION);
        if (elapsed >= OPEN_DURATION) {
          blinkPhase = "idle";
          blinkValue = 0;
        }
      } else {
        blinkValue = 0;
      }

      vrm.expressionManager.setValue("blink", blinkValue);
      rafRef.current = requestAnimationFrame(animate);
    }

    scheduleBlink();
    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (blinkTimerRef.current) clearTimeout(blinkTimerRef.current);
      cancelAnimationFrame(rafRef.current);
      vrm.expressionManager?.setValue("blink", 0);
    };
  }, [vrm, isSpeaking]);
}

/* =========================
   LIPSYNC HOOK
========================= */

export function useVRMLipSync(vrm: any) {
  const speakingRef = useRef(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useVRMBlink(vrm, isSpeaking);

  const speak = async (text: string) => {
    if (!vrm?.expressionManager || speakingRef.current) return;

    speakingRef.current = true;
    setIsSpeaking(true);

    const vowelMap: Record<string, string> = {
      a: "aa", á: "aa", ã: "aa", â: "aa",
      e: "ih", é: "ih", ê: "ih",
      i: "ih", í: "ih",
      o: "ou", ó: "ou", õ: "ou", ô: "ou",
      u: "ou", ú: "ou",
    };

    const chars = text.split("");
    let prevVowel = "";

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i].toLowerCase();
      const vowel = vowelMap[char];

      vrm.expressionManager.setValue("aa", 0);
      vrm.expressionManager.setValue("ih", 0);
      vrm.expressionManager.setValue("ou", 0);

      if (vowel) {
        const intensity = 0.6 + Math.random() * 0.4;
        vrm.expressionManager.setValue(vowel, intensity);
        prevVowel = vowel;
        await new Promise((r) => setTimeout(r, 55 + Math.random() * 30));
      } else if (char === " " || char === "," || char === ".") {
        await new Promise((r) => setTimeout(r, char === " " ? 40 : 120));
      } else {
        if (prevVowel) {
          vrm.expressionManager.setValue(prevVowel, 0.2);
        }
        await new Promise((r) => setTimeout(r, 35 + Math.random() * 20));
        prevVowel = "";
      }
    }

    vrm.expressionManager.setValue("aa", 0);
    vrm.expressionManager.setValue("ih", 0);
    vrm.expressionManager.setValue("ou", 0);

    speakingRef.current = false;
    setIsSpeaking(false);
  };

  return { speak, isSpeaking };
}
