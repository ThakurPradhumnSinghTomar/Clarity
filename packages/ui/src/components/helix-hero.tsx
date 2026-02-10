"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { KernelSize } from "postprocessing";
import React, { useMemo, useRef } from "react";
import * as THREE from "three";
import BlurEffect from "react-progressive-blur";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface HelixRingsProps {
  levelsUp?: number;
  levelsDown?: number;
  stepY?: number;
  rotationStep?: number;
}

const HelixRings: React.FC<HelixRingsProps> = ({
  levelsUp = 10,
  levelsDown = 10,
  stepY = 0.85,
  rotationStep = Math.PI / 16,
}) => {
  const groupRef = useRef<THREE.Group>(new THREE.Group());

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.rotation.y += 0.005;
    }
  });

  const ringGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    const radius = 0.35;
    shape.absarc(0, 0, radius, 0, Math.PI * 2, false);

    const depth = 10;
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      depth,
      bevelEnabled: true,
      bevelThickness: 0.05,
      bevelSize: 0.05,
      bevelSegments: 4,
      curveSegments: 64,
    };

    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.translate(0, 0, -depth / 2);

    return geometry;
  }, []);

  const elements = [];
  for (let i = -levelsDown; i <= levelsUp; i++) {
    elements.push({
      id: `helix-ring-${i}`,
      y: i * stepY,
      rotation: i * rotationStep,
    });
  }

  return (
    <group ref={groupRef} scale={1} position={[5, 0, 0]} rotation={[0, 0, 0]}>
      {elements.map((el) => (
        <mesh
          key={el.id}
          geometry={ringGeometry}
          position={[0, el.y, 0]}
          rotation={[0, Math.PI / 2 + el.rotation, 0]}
          castShadow
        >
          <meshPhysicalMaterial
            color="#45BFD3"
            metalness={0.7}
            roughness={0.5}
            clearcoat={0}
            clearcoatRoughness={0.15}
            reflectivity={0}
            iridescence={0.96}
            iridescenceIOR={1.5}
            iridescenceThicknessRange={[100, 400]}
          />
        </mesh>
      ))}
    </group>
  );
};

const Scene: React.FC = () => {
  return (
    <Canvas
      className="h-full w-full"
      orthographic
      shadows
      camera={{
        zoom: 70,
        position: [0, 0, 7],
        near: 0.1,
        far: 1000,
      }}
      gl={{ antialias: true }}
      style={{ background: "#ffffff" }}
    >
      <hemisphereLight color="#cfe8ff" groundColor="#ffffff" intensity={2} />

      <directionalLight
        position={[10, 10, 5]}
        intensity={2}
        castShadow
        color="#ffeedd"
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      <HelixRings />

      <EffectComposer multisampling={8}>
        <Bloom
          kernelSize={3}
          luminanceThreshold={0}
          luminanceSmoothing={0.4}
          intensity={0.6}
        />
        <Bloom
          kernelSize={KernelSize.HUGE}
          luminanceThreshold={0}
          luminanceSmoothing={0}
          intensity={0.5}
        />
      </EffectComposer>
    </Canvas>
  );
};

interface HeroProps {
  title: string;
  description: string;
}

export const Hero: React.FC<HeroProps> = ({ title, description }) => {
  const router = useRouter();

  return (
    <section className="relative h-screen w-screen font-sans tracking-tight text-gray-900 bg-white overflow-hidden">
      <div className="absolute inset-0 z-0">
        <motion.div
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, x: 80 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.1, ease: "easeOut" }}
        >
          
        </motion.div>
      </div>

      <div className="absolute inset-y-0 left-6 md:left-16 z-20 flex items-center">
        <motion.div
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-sm"
        >
          <h1 className="text-3xl font-light tracking-tight mb-4">{title}</h1>

          <p className="text-gray-700 text-sm leading-relaxed font-light tracking-tight mb-8">
            {description}
          </p>

          <div className="flex gap-3">
            {/* STUDY SESSION BUTTON */}
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/home/study-session")}
              className="
                cursor-pointer
                rounded-full
                border
                border-gray-200
                text-gray-700
                px-3
                py-2
                text-xs
                font-light
                shadow-sm
                hover:shadow-md
                hover:bg-gray-100
                transition
              "
            >
              Study Session
            </motion.button>

            {/* LOGIN BUTTON */}
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/login")}
              className="
                cursor-pointer
                rounded-full
                bg-gray-900
                text-white
                px-5
                py-2.5
                text-sm
                font-light
                shadow-sm
                hover:shadow-lg
                hover:bg-gray-800
                transition
              "
            >
              Log in
            </motion.button>

            {/* SIGNUP BUTTON */}
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push("/signup")}
              className="
                cursor-pointer
                rounded-full
                border
                border-gray-300
                text-gray-800
                px-5
                py-2.5
                text-sm
                font-light
                shadow-sm
                hover:shadow-md
                hover:bg-gray-100
                transition
              "
            >
              Sign up
            </motion.button>
          </div>
        </motion.div>
      </div>

      <BlurEffect
        className="absolute bg-linear-to-b from-transparent to-white/20 h-1/2 md:h-1/3 w-full bottom-0"
        position="bottom"
        intensity={50}
      />
      <BlurEffect
        className="absolute bg-linear-to-b from-white/20 to-transparent h-1/2 md:h-1/3 w-full top-0"
        position="top"
        intensity={50}
      />
    </section>
  );
};
