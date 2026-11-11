import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rosette } from "./Ornaments";
import styles from "./invitation.module.css";

interface IntroProps {
  groom: string;
  bride: string;
  dateShort: string;
  onOpen: () => void;
  onDone: () => void;
}

const ease = [0.76, 0, 0.24, 1] as const;

/** Opening screen: two ornamental doors with a monogram seal. Tapping it opens the doors. */
export default function Intro({ groom, bride, dateShort, onOpen, onDone }: IntroProps) {
  const [opening, setOpening] = useState(false);

  const open = () => {
    if (opening) return;
    setOpening(true);
    onOpen();
    window.setTimeout(onDone, 2300);
  };

  return (
    <div className={styles.intro} role="dialog" aria-label="Открыть приглашение">
      {/* doors */}
      <motion.div
        className={`${styles.door} ${styles.doorLeft}`}
        animate={opening ? { x: "-102%" } : { x: 0 }}
        transition={{ duration: 1.6, delay: 0.55, ease }}
      />
      <motion.div
        className={`${styles.door} ${styles.doorRight}`}
        animate={opening ? { x: "102%" } : { x: 0 }}
        transition={{ duration: 1.6, delay: 0.55, ease }}
      />

      <AnimatePresence>
        {!opening && (
          <motion.div
            className={styles.introContent}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.15, filter: "blur(8px)" }}
            transition={{ duration: 0.7 }}
          >
            <motion.p
              className={styles.introKicker}
              initial={{ opacity: 0, y: 12, letterSpacing: "0.1em" }}
              animate={{ opacity: 1, y: 0, letterSpacing: "0.42em" }}
              transition={{ duration: 1.6, delay: 0.3 }}
            >
              Приглашение на свадьбу
            </motion.p>

            <button type="button" className={styles.seal} onClick={open} aria-label="Открыть приглашение">
              <motion.span
                className={styles.sealHalo}
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
              >
                <Rosette size={260} strokeWidth={0.6} draw />
              </motion.span>
              <motion.span
                className={styles.sealPulse}
                animate={{ scale: [1, 1.18, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.span
                className={styles.sealCore}
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
              >
                <span className={styles.monogram}>
                  {groom.charAt(0)}
                  <span className={styles.monogramAmp}>&</span>
                  {bride.charAt(0)}
                </span>
              </motion.span>
            </button>

            <motion.p
              className={styles.introDate}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.2, delay: 1.1 }}
            >
              {dateShort}
            </motion.p>

            <motion.button
              type="button"
              className={styles.introButton}
              onClick={open}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 1.4 }}
            >
              <span>Открыть приглашение</span>
            </motion.button>
            <motion.p
              className={styles.introHint}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.7, 0] }}
              transition={{ duration: 2.4, delay: 2.2, repeat: Infinity }}
            >
              включите звук ♪
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* burst of light when opening */}
      <AnimatePresence>
        {opening && (
          <>
            {[0, 1, 2].map((i) => (
              <motion.span
                key={i}
                className={styles.burstRing}
                initial={{ scale: 0.2, opacity: 0.9 }}
                animate={{ scale: 4 + i, opacity: 0 }}
                transition={{ duration: 1.6, delay: i * 0.18, ease: "easeOut" }}
              />
            ))}
            <motion.span
              className={styles.burstGlow}
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: [0, 1, 0], scale: [0.4, 1.6, 2.4] }}
              transition={{ duration: 1.4 }}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
