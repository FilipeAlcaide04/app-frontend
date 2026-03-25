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

export function VRMAvatar({
  avatarUrl = "/avatars/placeholder.vrm",
  onReady,
}: {
  avatarUrl?: string;
  onReady?: (vrm: any) => void;
}) {
  return (
    <Canvas camera={{ position: [0, 1.2, 2], fov: 20 }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 5]} intensity={1.2} />
      <pointLight position={[0, 2, 2]} intensity={0.6} />

      <VRMModel avatarUrl={avatarUrl} onReady={onReady} />

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
  onReady,
}: {
  avatarUrl: string;
  onReady?: (vrm: any) => void;
}) {
  const [vrm, setVrm] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      avatarUrl,
      (gltf) => {
        if (!isMounted) return;

        const loadedVrm = gltf.userData.vrm;
        if (!loadedVrm) {
          console.error("❌ No VRM");
          return;
        }

        loadedVrm.scene.rotation.y = Math.PI;

        setVrm(loadedVrm);
        onReady?.(loadedVrm);

        console.log("✅ VRM READY");
      },
      undefined,
      (err) => console.error(err),
    );

    return () => {
      isMounted = false;
    };
  }, [avatarUrl, onReady]);

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

    // blink
    const t = performance.now() * 0.001;
    const blink = Math.abs(Math.sin(t * 2)) > 0.95 ? 1 : 0;

    vrm.expressionManager?.setValue("blink", blink);
  });

  if (!vrm) return null;

  return <primitive object={vrm.scene} scale={1.2} position={[0, -1.5, 0]} />;
}

/* =========================
   LIPSYNC HOOK
========================= */

export function useVRMLipSync(vrm: any) {
  const speakingRef = useRef(false);

  const speak = async (text: string) => {
    if (!vrm?.expressionManager || speakingRef.current) return;

    speakingRef.current = true;

    // Simulação simples de fala
    const letters = text.split("");

    for (let i = 0; i < letters.length; i++) {
      const char = letters[i].toLowerCase();

      let value = 0;

      if ("aeiou".includes(char)) value = 1;

      vrm.expressionManager.setValue("aa", value);

      await new Promise((r) => setTimeout(r, 60));
    }

    vrm.expressionManager.setValue("aa", 0);
    speakingRef.current = false;
  };

  return { speak };
}
