/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, Line } from "@react-three/drei";
import * as THREE from "three";

function RouteArc({ start, end, color }: { start: [number, number, number]; end: [number, number, number]; color: string }) {
  const curve = new THREE.QuadraticBezierCurve3(
    new THREE.Vector3(...start),
    new THREE.Vector3((start[0] + end[0]) / 2, 1.8, (start[2] + end[2]) / 2),
    new THREE.Vector3(...end)
  );
  const points = curve.getPoints(40);

  return <Line points={points} color={color} lineWidth={1.5} transparent opacity={0.6} />;
}

function GlobeNode({ position, color }: { position: [number, number, number]; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (ref.current) ref.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.05);
  });

  return (
    <Float speed={2} floatIntensity={0.5}>
      <group position={position}>
        <Sphere ref={ref} args={[0.35, 32, 32]}>
          <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} emissive={color} emissiveIntensity={0.2} />
        </Sphere>
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <mesh position={[0, -0.7, 0] as any}>
          <planeGeometry args={[1.2, 0.2]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0} />
        </mesh>
      </group>
    </Float>
  );
}

function SupplyChainScene() {
  const groupRef = useRef<THREE.Group>(null);
  useFrame((state) => {
    if (groupRef.current) groupRef.current.rotation.y = state.clock.elapsedTime * 0.08;
  });

  return (
    <group ref={groupRef}>
      <ambientLight intensity={0.5} />
      <pointLight position={[0, 3, 2]} intensity={1} color="#fbbf24" />
      <GlobeNode position={[-2.5, 0.3, 0]} color="#3b82f6" />
      <GlobeNode position={[0, 0, 0]} color="#d97706" />
      <GlobeNode position={[2.5, -0.2, 0]} color="#22c55e" />
      <RouteArc start={[-2.5, 0.3, 0]} end={[0, 0, 0]} color="#d97706" />
      <RouteArc start={[0, 0, 0]} end={[2.5, -0.2, 0]} color="#fbbf24" />
    </group>
  );
}

export default function SupplyChainGlobe({ className = "" }: { className?: string }) {
  return (
    <div className={`w-full h-full min-h-[280px] ${className}`}>
      <Canvas camera={{ position: [0, 1, 6], fov: 40 }} dpr={[1, 1.5]} gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <SupplyChainScene />
        </Suspense>
      </Canvas>
    </div>
  );
}
