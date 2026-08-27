import { useRef, useState, ReactNode, MouseEvent } from "react";
import { motion } from "motion/react";

interface TiltCardProps {
  children: ReactNode;
  className?: string;
  glareColor?: string;
  intensity?: number;
  onClick?: () => void;
}

export default function TiltCard({
  children,
  className = "",
  glareColor = "rgba(212, 175, 55, 0.12)",
  intensity = 15,
  onClick,
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState("perspective(1000px) rotateX(0deg) rotateY(0deg)");
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const [glareOpacity, setGlareOpacity] = useState(0);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    const rotateX = (-mouseY / (rect.height / 2)) * intensity;
    const rotateY = (mouseX / (rect.width / 2)) * intensity;

    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02,1.02,1.02)`);

    const glareX = ((e.clientX - rect.left) / rect.width) * 100;
    const glareY = ((e.clientY - rect.top) / rect.height) * 100;
    setGlarePosition({ x: glareX, y: glareY });
    setGlareOpacity(0.7);
  };

  const handleMouseLeave = () => {
    setTransform("perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)");
    setGlareOpacity(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      className={`relative ${className}`}
      style={{
        transform,
        transition: "transform 0.15s cubic-bezier(0.22, 1, 0.36, 1)",
        transformStyle: "preserve-3d",
      }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      {children}

      {/* Specular Glare */}
      <div
        className="absolute inset-0 rounded-[inherit] pointer-events-none z-10"
        style={{
          background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, ${glareColor} 0%, transparent 60%)`,
          opacity: glareOpacity,
          transition: "opacity 0.3s ease",
          mixBlendMode: "screen",
        }}
      />

      {/* Edge Highlight */}
      <div
        className="absolute inset-0 rounded-[inherit] pointer-events-none z-10"
        style={{
          background: `linear-gradient(${135 + (glarePosition.x - 50) * 0.5}deg, rgba(255,255,255,0.1) 0%, transparent 40%, transparent 60%, rgba(255,255,255,0.05) 100%)`,
          opacity: glareOpacity * 0.5,
          transition: "opacity 0.3s ease",
        }}
      />
    </motion.div>
  );
}
