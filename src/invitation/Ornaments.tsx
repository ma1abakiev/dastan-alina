import { motion } from "framer-motion";
import styles from "./invitation.module.css";

const GOLD = "url(#goldStroke)";

/** Shared SVG gradients, mounted once at the top of the page. */
export function GoldDefs() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <defs>
        <linearGradient id="goldStroke" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f6e7c1" />
          <stop offset="45%" stopColor="#d9b46a" />
          <stop offset="100%" stopColor="#a47c3b" />
        </linearGradient>
        <radialGradient id="goldGlow">
          <stop offset="0%" stopColor="#fff3d1" stopOpacity="1" />
          <stop offset="40%" stopColor="#e9c983" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#d9b46a" stopOpacity="0" />
        </radialGradient>
      </defs>
    </svg>
  );
}

const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/** Eight-pointed rosette inspired by Central Asian girih ornaments. */
export function Rosette({
  size = 80,
  draw = false,
  delay = 0,
  className,
  strokeWidth = 1.2,
}: {
  size?: number;
  draw?: boolean;
  delay?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const pathProps = (i: number) =>
    draw
      ? {
          initial: { pathLength: 0, opacity: 0 },
          whileInView: { pathLength: 1, opacity: 1 },
          viewport: { once: true, margin: "-40px" },
          transition: { duration: 1.6, delay: delay + i * 0.06, ease: [0.65, 0, 0.35, 1] as const },
        }
      : {};

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="-50 -50 100 100"
      fill="none"
      stroke={GOLD}
      strokeWidth={strokeWidth}
      strokeLinejoin="round"
      aria-hidden
    >
      {/* two interlaced squares -> 8-point star */}
      <motion.rect x="-27" y="-27" width="54" height="54" {...pathProps(0)} />
      <motion.rect x="-27" y="-27" width="54" height="54" transform="rotate(45)" {...pathProps(1)} />
      {/* petals */}
      {range(8).map((i) => (
        <motion.path
          key={i}
          d="M0 -6 C 6 -14, 6 -22, 0 -30 C -6 -22, -6 -14, 0 -6 Z"
          transform={`rotate(${i * 45 + 22.5})`}
          {...pathProps(2 + i * 0.3)}
        />
      ))}
      <motion.circle r="6" {...pathProps(3)} />
      <motion.circle r="43" strokeDasharray="1.5 4" {...pathProps(4)} />
      {range(8).map((i) => (
        <circle
          key={`d${i}`}
          r="1.8"
          cx={Math.cos((i * Math.PI) / 4) * 38}
          cy={Math.sin((i * Math.PI) / 4) * 38}
          fill="#d9b46a"
          stroke="none"
        />
      ))}
    </svg>
  );
}

/** Animated horizontal divider: lines grow out from a small rosette. */
export function Divider({ light = false }: { light?: boolean }) {
  const line = {
    initial: { pathLength: 0 },
    whileInView: { pathLength: 1 },
    viewport: { once: true },
    transition: { duration: 1.4, ease: [0.65, 0, 0.35, 1] as const },
  };
  return (
    <div className={`${styles.divider} ${light ? styles.dividerLight : ""}`} aria-hidden>
      <svg viewBox="0 0 320 40" fill="none" stroke={GOLD} strokeWidth="1">
        <motion.path d="M140 20 H10" {...line} />
        <motion.path d="M180 20 H310" {...line} />
        <motion.path d="M130 20 l-8 -6 l-8 6 l8 6 z" {...line} />
        <motion.path d="M190 20 l8 -6 l8 6 l-8 6 z" {...line} />
        <motion.circle cx="10" cy="20" r="2" fill="#d9b46a" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 1.2 }} />
        <motion.circle cx="310" cy="20" r="2" fill="#d9b46a" initial={{ scale: 0 }} whileInView={{ scale: 1 }} viewport={{ once: true }} transition={{ delay: 1.2 }} />
      </svg>
      <motion.div
        className={styles.dividerRosette}
        initial={{ rotate: -90, scale: 0.4, opacity: 0 }}
        whileInView={{ rotate: 0, scale: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <Rosette size={34} strokeWidth={2} />
      </motion.div>
    </div>
  );
}

/** Corner flourish used on cards; rotate via CSS for each corner. */
export function Corner({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 60 60" fill="none" stroke={GOLD} strokeWidth="1.2" aria-hidden>
      <motion.path
        d="M2 58 V18 Q2 2 18 2 H58 M10 58 V22 Q10 10 22 10 H58 M18 18 m-5 0 a5 5 0 1 0 10 0 a5 5 0 1 0 -10 0"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.8, ease: "easeInOut" }}
      />
    </svg>
  );
}
