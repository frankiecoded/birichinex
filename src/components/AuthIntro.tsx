import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";

type IntroPhase = "falling" | "shaking" | "transitioning" | "done";

const INTRO_CHARS = "BIRICHINEX".split("");
const GOLD_START = 7;

interface AuthIntroProps {
  onComplete: () => void;
}

export default function AuthIntro({ onComplete }: AuthIntroProps) {
  const [introPhase, setIntroPhase] = useState<IntroPhase>("falling");

  const letterStyles = useMemo(
    () =>
      INTRO_CHARS.map((_, i) => ({
        fallDelay: 0.2 + i * 0.08,
        shakeDelay: i * 0.07,
        startRotate: (i % 2 === 0 ? -1 : 1) * (8 + (i % 3) * 3),
      })),
    [],
  );

  useEffect(() => {
    const t1 = setTimeout(() => setIntroPhase("shaking"), 1500);
    const t2 = setTimeout(() => setIntroPhase("transitioning"), 2800);
    const t3 = setTimeout(() => {
      setIntroPhase("done");
      onComplete();
    }, 3800);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {introPhase !== "done" && (
        <motion.div
          key="auth-splash"
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Dark backdrop */}
          <div
            className="absolute inset-0 bg-[#0a0a12]"
            style={{ backdropFilter: "blur(40px) saturate(150%)" }}
          />

          {/* Ambient glow */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full opacity-30"
            style={{
              background: "radial-gradient(ellipse, rgba(212,175,55,0.2) 0%, transparent 70%)",
              filter: "blur(50px)",
            }}
          />

          {/* Centered letter row */}
          <div className="absolute top-[42vh] left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center px-4">
            {INTRO_CHARS.map((char, i) => {
              const isGold = i >= GOLD_START;
              const { fallDelay, shakeDelay, startRotate } = letterStyles[i];
              const dir = i % 2 === 0 ? -1 : 1;

              return (
                <motion.span
                  key={`intro-${i}`}
                  className={`inline-block font-black select-none ${
                    isGold
                      ? "text-transparent bg-clip-text bg-gradient-to-r from-[#d4af37] via-[#f0d060] to-[#d4af37]"
                      : "text-white"
                  }`}
                  style={{
                    fontSize: "clamp(2.5rem, 8vw, 7rem)",
                    lineHeight: 1,
                    letterSpacing: "-0.02em",
                    textShadow: isGold
                      ? "0 0 40px rgba(212,175,55,0.4)"
                      : "0 0 40px rgba(255,255,255,0.15)",
                  }}
                  initial={{ y: "-90vh", opacity: 0, rotateZ: startRotate, scale: 1.2 }}
                  animate={
                    introPhase === "falling"
                      ? { y: 0, opacity: 1, rotateZ: 0, scale: 1 }
                      : introPhase === "shaking"
                        ? {
                            y: 0,
                            opacity: 1,
                            rotateZ: 0,
                            scale: 1,
                            x: [0, dir * 3, dir * -2.5, dir * 2, dir * -1.5, dir * 0.8, 0],
                          }
                        : introPhase === "transitioning"
                          ? { y: 0, opacity: 0, rotateZ: 0, scale: 1 }
                          : { y: 0, opacity: 1, rotateZ: 0, scale: 1 }
                  }
                  transition={{
                    y: { duration: 0.55, delay: fallDelay, ease: [0.22, 1, 0.36, 1] },
                    opacity: { duration: 0.3, delay: fallDelay },
                    rotateZ: { duration: 0.5, delay: fallDelay, ease: [0.22, 1, 0.36, 1] },
                    scale: { duration: 0.5, delay: fallDelay, ease: [0.22, 1, 0.36, 1] },
                    x:
                      introPhase === "shaking"
                        ? { duration: 0.9, delay: shakeDelay, ease: "easeInOut", repeat: Infinity, repeatDelay: 2.6 }
                        : { duration: 0.5, delay: fallDelay, ease: [0.22, 1, 0.36, 1] },
                  }}
                >
                  {char}
                </motion.span>
              );
            })}
          </div>

          {/* Transition flash */}
          {introPhase === "transitioning" && (
            <motion.div
              className="absolute inset-0 bg-white pointer-events-none z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.2, 0] }}
              transition={{ duration: 0.5 }}
            />
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
