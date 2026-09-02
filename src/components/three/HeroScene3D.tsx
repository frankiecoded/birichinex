import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshDistortMaterial, MeshWobbleMaterial } from "@react-three/drei";
import * as THREE from "three";
import useWebGLSupport from "../../hooks/useWebGLSupport";

function HeroTorus() {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.rotation.x = Math.sin(t * 0.3) * 0.3;
    ref.current.rotation.y = t * 0.2;
    ref.current.rotation.z = Math.cos(t * 0.2) * 0.1;
  });

  return (
    <Float speed={1.5} rotationIntensity={0.4} floatIntensity={1.2}>
      <mesh ref={ref} position={[0, 0, 0]}>
        <torusKnotGeometry args={[1.2, 0.4, 200, 32]} />
        <MeshDistortMaterial
          color="#d4af37"
          transparent
          opacity={0.2}
          roughness={0.1}
          metalness={0.9}
          distort={0.15}
          speed={2}
        />
      </mesh>
    </Float>
  );
}

function HeroSphere() {
  return (
    <Float speed={0.8} rotationIntensity={0.2} floatIntensity={0.8}>
      <mesh position={[3, -1, -2]}>
        <sphereGeometry args={[0.8, 64, 64]} />
        <MeshWobbleMaterial
          color="#d4af37"
          transparent
          opacity={0.1}
          roughness={0}
          metalness={1}
          factor={0.2}
          speed={1}
        />
      </mesh>
    </Float>
  );
}

function GlassBox() {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    ref.current.rotation.x = t * 0.15;
    ref.current.rotation.y = t * 0.1;
    ref.current.position.y = Math.sin(t * 0.5) * 0.3;
  });

  return (
    <mesh ref={ref} position={[-3, 1, -3]}>
      <boxGeometry args={[1.2, 1.2, 1.2]} />
      <meshStandardMaterial
        color="#d4af37"
        transparent
        opacity={0.06}
        wireframe
        roughness={0}
        metalness={1}
      />
    </mesh>
  );
}

function HeroParticles() {
  const count = 120;
  const mesh = useRef<THREE.Points>(null!);

  const [positions, sizes] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 10 - 3;
      sz[i] = Math.random() * 2 + 0.5;
    }
    return [pos, sz];
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    mesh.current.rotation.y = state.clock.getElapsedTime() * 0.02;
    mesh.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.05) * 0.1;
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={count}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        color="#d4af37"
        size={0.04}
        transparent
        opacity={0.5}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

function RimLight() {
  return (
    <>
      <directionalLight position={[5, 5, 5]} intensity={0.3} color="#ffffff" />
      <pointLight position={[-5, 3, 2]} intensity={0.4} color="#d4af37" distance={20} />
      <pointLight position={[5, -3, 2]} intensity={0.2} color="#64d2ff" distance={15} />
    </>
  );
}

interface HeroScene3DProps {
  className?: string;
}

export default function HeroScene3D({ className = "" }: HeroScene3DProps) {
  const webglSupported = useWebGLSupport();

  if (!webglSupported) {
    return null;
  }

  return (
    <div className={`absolute inset-0 ${className}`} style={{ pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.1} />
        <RimLight />
        <HeroTorus />
        <HeroSphere />
        <GlassBox />
        <HeroParticles />
      </Canvas>
    </div>
  );
}
