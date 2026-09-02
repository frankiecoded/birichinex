import { motion, useMotionValue, useSpring } from "motion/react";

/**
 * Apple-style 3D tilt-on-hover card. The inner children are lifted on the Z
 * axis so content floats perceptibly above the surface as it tilts.
 */
export default function TiltCard({
  children,
  className = "",
  max = 12,
  lift = 42,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
  lift?: number;
}) {
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 190, damping: 20 });
  const sry = useSpring(ry, { stiffness: 190, damping: 20 });

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    ry.set(px * max);
    rx.set(-py * max);
  };

  return (
    <motion.div
      onMouseMove={handleMove}
      onMouseLeave={() => { rx.set(0); ry.set(0); }}
      style={{ rotateX: srx, rotateY: sry }}
      className={`[transform-style:preserve-3d] will-change-transform ${className}`}
    >
      <div style={{ transform: `translateZ(${lift}px)` }} className="h-full [transform-style:preserve-3d]">
        {children}
      </div>
    </motion.div>
  );
}