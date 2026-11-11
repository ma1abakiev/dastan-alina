import { motion } from "framer-motion";
import styles from "./invitation.module.css";

export default function MusicToggle({ playing, onToggle }: { playing: boolean; onToggle: () => void }) {
  return (
    <motion.button
      type="button"
      className={styles.music}
      onClick={onToggle}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 2.4, duration: 0.6 }}
      aria-label={playing ? "Выключить музыку" : "Включить музыку"}
      aria-pressed={playing}
    >
      <motion.span
        className={styles.musicDisc}
        animate={{ rotate: playing ? 360 : 0 }}
        transition={playing ? { duration: 6, repeat: Infinity, ease: "linear" } : { duration: 0.6 }}
      />
      <span className={styles.musicBars}>
        {[0, 1, 2, 3].map((i) => (
          <motion.span
            key={i}
            animate={playing ? { scaleY: [0.3, 1, 0.5, 0.9, 0.3] } : { scaleY: 0.25 }}
            transition={playing ? { duration: 1.1 + i * 0.15, repeat: Infinity, ease: "easeInOut" } : { duration: 0.3 }}
          />
        ))}
      </span>
    </motion.button>
  );
}
