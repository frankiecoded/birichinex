import { useRef, useState, MouseEvent, ReactNode } from "react";

interface CursorSpotlightProps {
  children: ReactNode;
  className?: string;
  spotlightColor?: string;
  spotlightSize?: number;
}

export default function CursorSpotlight({
  children,
  className = "",
  spotlightColor = "rgba(212, 175, 55, 0.06)",
  spotlightSize = 400,
}: CursorSpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [visible, setVisible] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      className={`relative overflow-hidden ${className}`}
    >
      <div
        className="absolute pointer-events-none z-0 transition-opacity duration-300"
        style={{
          width: spotlightSize,
          height: spotlightSize,
          left: position.x - spotlightSize / 2,
          top: position.y - spotlightSize / 2,
          background: `radial-gradient(circle, ${spotlightColor} 0%, transparent 70%)`,
          opacity: visible ? 1 : 0,
          filter: "blur(40px)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
