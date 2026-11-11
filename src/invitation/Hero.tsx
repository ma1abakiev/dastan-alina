import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { SplitText } from "./Reveal";
import { Rosette } from "./Ornaments";
import styles from "./invitation.module.css";

interface HeroProps {
  groom: string;
  bride: string;
  date: string;
  time: string;
  portraitSrc: string;
  landscapeSrc: string;
}

export default function Hero({ groom, bride, date, time, portraitSrc, landscapeSrc }: HeroProps) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["0%", "28%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "-35%"]);
  const fade = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section ref={ref} className={styles.hero}>
      <motion.div className={styles.heroMedia} style={{ y: imgY }}>
        <motion.picture
          initial={{ scale: 1.25 }}
          animate={{ scale: 1.04 }}
          transition={{ duration: 9, ease: "easeOut" }}
          style={{ display: "block", width: "100%", height: "100%" }}
        >
          <source media="(min-aspect-ratio: 1/1)" srcSet={landscapeSrc} />
          <img src={portraitSrc} alt={`${groom} и ${bride}`} className={styles.heroImg} />
        </motion.picture>
      </motion.div>
      <div className={styles.heroShade} />

      <motion.div className={styles.heroContent} style={{ y: contentY, opacity: fade }}>
        <motion.div
          className={styles.heroRosette}
          initial={{ opacity: 0, rotate: -180, scale: 0.4 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          transition={{ duration: 2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        >
          <Rosette size={58} strokeWidth={1.4} />
        </motion.div>

        <motion.p
          className={styles.kicker}
          initial={{ opacity: 0, letterSpacing: "0.1em" }}
          animate={{ opacity: 1, letterSpacing: "0.38em" }}
          transition={{ duration: 1.8, delay: 0.6 }}
        >
          Мы женимся
        </motion.p>

        <h1 className={styles.heroNames}>
          <SplitText text={groom} className={styles.heroName} delay={0.9} />
          <motion.span
            className={styles.heroAmp}
            initial={{ opacity: 0, scale: 0.3 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, delay: 1.5, ease: [0.34, 1.56, 0.64, 1] }}
          >
            и
          </motion.span>
          <SplitText text={bride} className={styles.heroName} delay={1.8} />
        </h1>

        <motion.div
          className={styles.heroDate}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, delay: 2.6 }}
        >
          <span className={styles.heroLine} />
          <span>{date}</span>
          <span className={styles.heroDot}>◆</span>
          <span>{time}</span>
          <span className={styles.heroLine} />
        </motion.div>
      </motion.div>

      <motion.a
        href="#invite"
        className={styles.scrollCue}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3.4, duration: 1 }}
        aria-label="Листать вниз"
      >
        <span>листайте</span>
        <motion.span
          className={styles.scrollCueLine}
          animate={{ scaleY: [0, 1, 0], originY: [0, 0, 1] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.a>
    </section>
  );
}
