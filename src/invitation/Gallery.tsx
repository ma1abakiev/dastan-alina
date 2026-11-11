import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence, PanInfo } from "framer-motion";
import { SectionTitle } from "./Sections";
import type { GalleryPhoto } from "../types";
import styles from "./invitation.module.css";

const ease = [0.22, 1, 0.36, 1] as const;

function Lightbox({
  photos,
  index,
  onClose,
  onIndex,
}: {
  photos: GalleryPhoto[];
  index: number;
  onClose: () => void;
  onIndex: (i: number) => void;
}) {
  const [direction, setDirection] = useState(0);
  const go = useCallback(
    (d: number) => {
      setDirection(d);
      onIndex((index + d + photos.length) % photos.length);
    },
    [index, photos.length, onIndex],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    document.body.classList.add("is-locked");
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.classList.remove("is-locked");
    };
  }, [go, onClose]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -60 || info.velocity.x < -400) go(1);
    else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
    else if (Math.abs(info.offset.y) > 120) onClose();
  };

  const photo = photos[index];

  // Preload neighbours so swiping never shows an empty frame.
  useEffect(() => {
    [photos[(index + 1) % photos.length], photos[(index - 1 + photos.length) % photos.length]].forEach((p) => {
      const img = new Image();
      img.src = p.src;
    });
  }, [index, photos]);

  return (
    <motion.div
      className={styles.lightbox}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Просмотр фотографий"
    >
      <div className={styles.lbStage}>
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.img
            key={photo.src}
            src={photo.src}
            alt={`Фото ${index + 1}`}
            className={styles.lbImg}
            custom={direction}
            variants={{
              enter: (d: number) => ({ x: d >= 0 ? "40%" : "-40%", opacity: 0, scale: 0.92 }),
              center: { x: 0, opacity: 1, scale: 1 },
              exit: (d: number) => ({ x: d >= 0 ? "-40%" : "40%", opacity: 0, scale: 0.92 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease }}
            drag
            dragSnapToOrigin
            dragElastic={0.6}
            onDragEnd={onDragEnd}
            onClick={(e) => e.stopPropagation()}
            draggable={false}
          />
        </AnimatePresence>
      </div>

      <button type="button" className={`${styles.lbBtn} ${styles.lbClose}`} onClick={onClose} aria-label="Закрыть">
        ✕
      </button>
      <button
        type="button"
        className={`${styles.lbBtn} ${styles.lbPrev}`}
        onClick={(e) => {
          e.stopPropagation();
          go(-1);
        }}
        aria-label="Предыдущее фото"
      >
        ‹
      </button>
      <button
        type="button"
        className={`${styles.lbBtn} ${styles.lbNext}`}
        onClick={(e) => {
          e.stopPropagation();
          go(1);
        }}
        aria-label="Следующее фото"
      >
        ›
      </button>

      <div className={styles.lbThumbs} onClick={(e) => e.stopPropagation()}>
        {photos.map((p, i) => (
          <button
            key={p.src}
            type="button"
            className={`${styles.lbThumb} ${i === index ? styles.lbThumbActive : ""}`}
            onClick={() => {
              setDirection(i > index ? 1 : -1);
              onIndex(i);
            }}
            aria-label={`Фото ${i + 1}`}
          >
            <img src={p.thumb} alt="" loading="lazy" />
          </button>
        ))}
      </div>
      <p className={styles.lbCounter}>
        {index + 1} / {photos.length}
      </p>
    </motion.div>
  );
}

export default function Gallery({ photos }: { photos: GalleryPhoto[] }) {
  const [open, setOpen] = useState<number | null>(null);
  if (photos.length === 0) return null;

  return (
    <section className={styles.section}>
      <SectionTitle kicker="Наша история" title="Моменты любви" />

      <div className={styles.gallery}>
        {photos.map((p, i) => {
          return (
            <motion.button
              key={p.src}
              type="button"
              className={styles.galleryItem}
              onClick={() => setOpen(i)}
              initial={{ opacity: 0, y: 50, scale: 0.94, rotate: i % 2 ? 2 : -2 }}
              whileInView={{ opacity: 1, y: 0, scale: 1, rotate: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 1, delay: (i % 3) * 0.12, ease }}
              whileHover={{ y: -6 }}
              aria-label={`Открыть фото ${i + 1}`}
            >
              <img src={p.thumb} alt={`Фото ${i + 1}`} decoding="async" width={p.w} height={p.h} style={{ aspectRatio: `${p.w} / ${p.h}` }} />
              <span className={styles.galleryShine} aria-hidden />
              <span className={styles.galleryZoom} aria-hidden>
                ⤢
              </span>
            </motion.button>
          );
        })}
      </div>
      <p className={styles.galleryHint}>Нажмите на фото, чтобы открыть</p>

      {/* Portal: must sit above the fixed scroll ornaments and music button */}
      {createPortal(
        <AnimatePresence>
          {open !== null && <Lightbox photos={photos} index={open} onClose={() => setOpen(null)} onIndex={setOpen} />}
        </AnimatePresence>,
        document.body,
      )}
    </section>
  );
}
