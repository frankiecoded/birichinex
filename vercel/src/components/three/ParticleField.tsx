import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Particles({ count = 80, color = "#d4af37" }: { count?: number; color?: string }) {
  const mesh = useRef<THREE.InstancedMesh>(null!);
  const light = useRef<THREE.PointLight>(null!);

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const t = Math.random() * 100;
      const factor = 20 + Math.random() * 80;
      const speed = 0.002 + Math.random() / 200;
      const xFact = (Math.random() - 0.5) * 2;
      const yFact = (Math.random() - 0.5) * 2;
      const zFact = (Math.random() - 0.5) * 2;
      temp.push({ t, factor, speed, xFact, yFact, zFact, mx: 0, my: 0 });
    }
    return temp;
  }, [count]);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.getElapsedTime() * 0.1;
    particles.forEach((particle, i) => {
      let { t, factor, speed, xFact, yFact, zFact } = particle;
      t = particle.t += speed / 2;
      const s = Math.cos(t);
      const a = Math.cos(t * 0.5);
      dummy.position.set(
        xFact * 4 + Math.cos((t / 10) * factor) + (Math.sin(t * 1) * factor) / 10,
        yFact * 4 + Math.sin((t / 10) * factor) + (Math.cos(t * 2) * factor) / 10,
        zFact * 4 + Math.cos((t / 10) * factor) + (Math.sin(t * 3) * factor) / 10
      );
      dummy.scale.setScalar(Math.max(0.01, s * 0.15 + 0.05));
      dummy.updateMatrix();
      mesh.current.setMatrixAt(i, dummy.matrix);
    });
    mesh.current.instanceMatrix.needsUpdate = true;

    if (light.current) {
      light.current.position.set(
        Math.sin(time * 0.7) * 4,
        Math.cos(time * 0.5) * 2,
        Math.sin(time * 0.3) * 3
      );
    }
  });

  return (
    <>
      <pointLight ref={light} color={color} intensity={0.8} distance={15} />
      <instancedMesh ref={mesh} args={[undefined, undefined, count]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.6}
          roughness={0.3}
          metalness={0.8}
        />
      </instancedMesh>
    </>
  );
}

function FloatingRing({ position, scale = 1, speed = 1 }: { position: [number, number, number]; scale?: number; speed?: number }) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    ref.current.rotation.x = Math.sin(t * 0.3) * 0.2;
    ref.current.rotation.y = t * 0.15;
    ref.current.position.y = position[1] + Math.sin(t * 0.5) * 0.3;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <torusGeometry args={[1, 0.02, 16, 100]} />
      <meshStandardMaterial
        color="#d4af37"
        transparent
        opacity={0.25}
        roughness={0.1}
        metalness={0.9}
      />
    </mesh>
  );
}

function FloatingSphere({ position, scale = 1, speed = 1 }: { position: [number, number, number]; scale?: number; speed?: number }) {
  const ref = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime() * speed;
    ref.current.position.y = position[1] + Math.sin(t * 0.7) * 0.4;
    ref.current.position.x = position[0] + Math.cos(t * 0.3) * 0.2;
    ref.current.rotation.x = t * 0.2;
    ref.current.rotation.z = t * 0.1;
  });

  return (
    <mesh ref={ref} position={position} scale={scale}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial
        color="#d4af37"
        transparent
        opacity={0.08}
        wireframe
        roughness={0.1}
        metalness={1}
      />
    </mesh>
  );
}

interface ParticleFieldProps {
  className?: string;
  particleCount?: number;
  color?: string;
  showGeometry?: boolean;
}

export default function ParticleField({
  className = "",
  particleCount = 60,
  color = "#d4af37",
  showGeometry = true,
}: ParticleFieldProps) {
  return (
    <div className={`absolute inset-0 ${className}`} style={{ pointerEvents: "none" }}>
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.15} />
        <Particles count={particleCount} color={color} />
        {showGeometry && (
          <>
            <FloatingRing position={[-3, 1, -2]} scale={1.2} speed={0.5} />
            <FloatingRing position={[3, -1, -3]} scale={0.8} speed={0.7} />
            <FloatingSphere position={[2, 2, -4]} scale={0.6} speed={0.4} />
            <FloatingSphere position={[-2, -2, -3]} scale={0.4} speed={0.6} />
          </>
        )}
      </Canvas>
    </div>
  );
}
