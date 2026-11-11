import { motion, useScroll, useSpring, useTransform, MotionValue } from "framer-motion";
import { Rosette } from "./Ornaments";
import styles from "./invitation.module.css";

const H = 1000;
const W = 60;
const CX = W / 2;
const AMP = 15;
const WAVES = 6;

const wave = (phase: number) => {
  let d = "";
  for (let y = 0; y <= H; y += 5) {
    const x = CX + AMP * Math.sin((y / H) * WAVES * 2 * Math.PI + phase);
    d += `${y === 0 ? "M" : "L"}${x.toFixed(2)} ${y}`;
  }
  return d;
};

const PATH_A = wave(0);
const PATH_B = wave(Math.PI);
// Points where the two strands cross -> a rosette "bead" blooms there as you scroll past.
const NODES = Array.from({ length: WAVES * 2 - 1 }, (_, k) => ((k + 1) * H) / (WAVES * 2));
// Leaves at every wave crest, alternating sides.
const LEAVES = Array.from({ length: WAVES * 2 }, (_, k) => ({
  y: ((k + 0.5) * H) / (WAVES * 2),
  side: k % 2 === 0 ? 1 : -1,
}));

function Node({ y, progress }: { y: number; progress: MotionValue<number> }) {
  const t = y / H;
  const scale = useTransform(progress, [t - 0.03, t], [0, 1], { clamp: true });
  const rotate = useTransform(progress, [t - 0.03, t + 0.1], [-120, 0], { clamp: true });
  return (
    <motion.g style={{ scale, rotate, originX: `${CX}px`, originY: `${y}px` }}>
      <circle cx={CX} cy={y} r="6.5" fill="#061821" stroke="url(#goldStroke)" strokeWidth="1" />
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse
          key={i}
          cx={CX}
          cy={y - 4}
          rx="1.4"
          ry="3"
          fill="#d9b46a"
          transform={`rotate(${i * 45} ${CX} ${y})`}
        />
      ))}
      <circle cx={CX} cy={y} r="1.6" fill="#fff3d1" />
    </motion.g>
  );
}

function Leaf({ y, side, progress }: { y: number; side: number; progress: MotionValue<number> }) {
  const t = y / H;
  const opacity = useTransform(progress, [t - 0.04, t], [0, 1], { clamp: true });
  const x = CX + side * AMP;
  return (
    <motion.path
      style={{ opacity }}
      d={`M${x} ${y} q ${side * 9} -8 ${side * 14} -2 q ${-side * 6} 8 ${-side * 14} 2 z`}
      fill="rgba(217,180,106,0.55)"
      stroke="url(#goldStroke)"
      strokeWidth="0.6"
    />
  );
}

function Strand({ mirrored }: { mirrored?: boolean }) {
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 70, damping: 22, mass: 0.6 });
  const beadY = useTransform(progress, (v) => v * H);
  const beadX = useTransform(progress, (v) => CX + AMP * Math.sin(v * WAVES * 2 * Math.PI));

  return (
    <div className={`${styles.scrollOrnament} ${mirrored ? styles.scrollOrnamentRight : ""}`} aria-hidden>
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" fill="none">
        {/* faint track */}
        <path d={PATH_A} stroke="rgba(217,180,106,0.12)" strokeWidth="1" />
        <path d={PATH_B} stroke="rgba(217,180,106,0.12)" strokeWidth="1" />
        <path d={`M${CX} 0 V${H}`} stroke="rgba(217,180,106,0.08)" strokeWidth="0.6" strokeDasharray="2 6" />
        {/* drawn strands follow the scroll */}
        <motion.path d={PATH_A} stroke="url(#goldStroke)" strokeWidth="1.4" strokeLinecap="round" style={{ pathLength: progress }} />
        <motion.path d={PATH_B} stroke="url(#goldStroke)" strokeWidth="1.4" strokeLinecap="round" style={{ pathLength: progress }} />
        {LEAVES.map((l, i) => (
          <Leaf key={i} y={l.y} side={l.side} progress={progress} />
        ))}
        {NODES.map((y) => (
          <Node key={y} y={y} progress={progress} />
        ))}
        {/* glowing bead at the tip */}
        <motion.circle cx={beadX} cy={beadY} r="9" fill="url(#goldGlow)" />
        <motion.circle cx={beadX} cy={beadY} r="2.4" fill="#fff6dc" />
      </svg>
    </div>
  );
}

/** Ornament that grows along both edges of the screen while scrolling, plus a slow rotating mandala behind the content. */
export default function ScrollOrnament() {
  const { scrollYProgress } = useScroll();
  const rotate = useTransform(scrollYProgress, [0, 1], [0, 240]);
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.25, 1]);

  return (
    <>
      <motion.div className={styles.mandala} style={{ rotate, scale }} aria-hidden>
        <Rosette size={720} strokeWidth={0.35} />
      </motion.div>
      <Strand />
      <Strand mirrored />
    </>
  );
}
