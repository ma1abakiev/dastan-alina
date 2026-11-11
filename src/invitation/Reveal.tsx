import { motion } from "framer-motion";
import { Fragment } from "react";
import type { ReactNode, CSSProperties } from "react";

const ease = [0.22, 1, 0.36, 1] as const;

/** Fades content up out of a soft blur when it enters the viewport. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 1.1, delay, ease }}
    >
      {children}
    </motion.div>
  );
}

/** Splits text into letters that rise in one after another. */
export function SplitText({
  text,
  className,
  delay = 0,
  stagger = 0.06,
  inView = false,
}: {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  inView?: boolean;
}) {
  const trigger = inView
    ? { whileInView: "show", viewport: { once: true, margin: "-40px" } }
    : { animate: "show" };
  return (
    <motion.span
      className={className}
      initial="hidden"
      {...trigger}
      variants={{ show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
      aria-label={text}
      style={{ display: "inline-block" }}
    >
      {text.split(" ").map((word, wi, words) => (
        // Letters are grouped per word so lines only break between words.
        <Fragment key={wi}>
        <span aria-hidden style={{ display: "inline-block", whiteSpace: "nowrap" }}>
          {Array.from(word).map((ch, i) => (
            <motion.span
              key={i}
              style={{ display: "inline-block" }}
              variants={{
                hidden: { opacity: 0, y: "0.6em", rotate: -8, filter: "blur(6px)" },
                show: { opacity: 1, y: 0, rotate: 0, filter: "blur(0px)", transition: { duration: 0.9, ease } },
              }}
            >
              {ch}
            </motion.span>
          ))}
        </span>
        {wi < words.length - 1 ? " " : null}
        </Fragment>
      ))}
    </motion.span>
  );
}

/** Reveals words one by one (for longer paragraphs). */
export function WordReveal({ text, className }: { text: string; className?: string }) {
  const words = text.split(" ");
  return (
    <motion.p
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ show: { transition: { staggerChildren: 0.035 } } }}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          style={{ display: "inline-block", marginRight: "0.28em" }}
          variants={{
            hidden: { opacity: 0, y: 10, filter: "blur(4px)" },
            show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease } },
          }}
        >
          {w}
        </motion.span>
      ))}
    </motion.p>
  );
}
