/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, Stars } from "@react-three/drei";
import * as THREE from "three";

function TradeCore() {
  const groupRef = useRef<THREE.Group>(null);
  const innerRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.15;
      groupRef.current.rotation.x = Math.sin(t * 0.2) * 0.08;
    }
    if (innerRef.current) {
      innerRef.current.rotation.z = t * 0.35;
    }
  });

  return (
    <group ref={groupRef}>
      <Float speed={1.5} rotationIntensity={0.4} floatIntensity={1.2}>
        <mesh ref={innerRef}>
          <torusKnotGeometry args={[1.1, 0.32, 128, 32]} />
          <MeshDistortMaterial
            color="#d97706"
            metalness={0.85}
            roughness={0.15}
            distort={0.25}
            speed={2}
            emissive="#92400e"
            emissiveIntensity={0.15}
          />
        </mesh>
      </Float>

      {[0, 1, 2, 3, 4, 5].map((i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <Sphere key={i} args={[0.12, 16, 16]} position={[Math.cos(angle) * 2.2, Math.sin(angle * 0.5) * 0.8, Math.sin(angle) * 2.2]}>
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.1} emissive="#d97706" emissiveIntensity={0.3} />
          </Sphere>
        );
      })}
    </group>
  );
}

function ParticleField() {
  const count = 120;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 12;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return arr;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.04} color="#fbbf24" transparent opacity={0.6} sizeAttenuation />
    </points>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={1.2} color="#fff7ed" />
      <pointLight position={[-4, 2, 3]} intensity={0.8} color="#d97706" />
      <pointLight position={[4, -2, -3]} intensity={0.5} color="#fbbf24" />
      <Stars radius={50} depth={30} count={800} factor={3} saturation={0.2} fade speed={0.5} />
      <ParticleField />
      <TradeCore />
    </>
  );
}

interface HeroScene3DProps {
  className?: string;
}

export default function HeroScene3D({ className = "" }: HeroScene3DProps) {
  return (
    <div className={`absolute inset-0 ${className}`} aria-hidden="true">
      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  );
}
