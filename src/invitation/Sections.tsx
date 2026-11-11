import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Reveal, SplitText, WordReveal } from "./Reveal";
import { Divider, Corner, Rosette } from "./Ornaments";
import type { VenueInfo } from "../types";
import styles from "./invitation.module.css";

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div className={styles.sectionHead}>
      <Reveal>
        <p className={styles.kicker}>{kicker}</p>
      </Reveal>
      <h2 className={styles.sectionTitle}>
        <SplitText text={title} inView stagger={0.045} />
      </h2>
      <Divider />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Invitation text with an arched photo                                 */
/* ------------------------------------------------------------------ */

export function InviteSection({ photo, groom, bride }: { photo: string; groom: string; bride: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const imgY = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);
  const ringRotate = useTransform(scrollYProgress, [0, 1], [-60, 60]);

  return (
    <section id="invite" className={styles.section}>
      <SectionTitle kicker="Дорогие наши" title="Приглашаем вас" />

      <Reveal>
        <p className={styles.lead}>
          разделить с нами радость
          <br />
          нашей свадьбы!
        </p>
      </Reveal>

      <div ref={ref} className={styles.archWrap}>
        <motion.div className={styles.archRing} style={{ rotate: ringRotate }} aria-hidden>
          <Rosette size={420} strokeWidth={0.4} />
        </motion.div>
        <div className={styles.arch}>
          <motion.img src={photo} alt={`${groom} и ${bride}`} style={{ y: imgY, scale: 1.25 }} decoding="async" />
          {/* curtain that lifts to reveal the photo */}
          <motion.div
            className={styles.archCurtain}
            initial={{ scaleY: 1 }}
            whileInView={{ scaleY: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 1.6, ease: [0.76, 0, 0.24, 1] }}
            aria-hidden
          />
        </div>
        <svg className={styles.archFrame} viewBox="0 0 300 420" fill="none" aria-hidden>
          <motion.path
            d="M10 410 V150 A140 140 0 0 1 290 150 V410 Z"
            stroke="url(#goldStroke)"
            strokeWidth="1.2"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2.4, ease: "easeInOut" }}
          />
          <motion.path
            d="M22 398 V152 A128 128 0 0 1 278 152 V398 Z"
            stroke="url(#goldStroke)"
            strokeWidth="0.6"
            strokeDasharray="2 5"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 2.8, delay: 0.3, ease: "easeInOut" }}
          />
        </svg>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Date: calendar + countdown                                           */
/* ------------------------------------------------------------------ */

const WEEKDAYS = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const MONTHS = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

function useCountdown(target: number) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  const diff = Math.max(0, target - now);
  return {
    done: diff === 0,
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff / 3600000) % 24),
    minutes: Math.floor((diff / 60000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function plural(n: number, forms: [string, string, string]) {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return forms[0];
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1];
  return forms[2];
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  const str = String(value).padStart(2, "0");
  return (
    <div className={styles.timeUnit}>
      <div className={styles.timeValue}>
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={str}
            initial={{ y: "-70%", opacity: 0, rotateX: 80 }}
            animate={{ y: 0, opacity: 1, rotateX: 0 }}
            exit={{ y: "70%", opacity: 0, rotateX: -80 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {str}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className={styles.timeLabel}>{label}</span>
    </div>
  );
}

export function DateSection({ isoDate, time }: { isoDate: string; time: string }) {
  const target = useMemo(() => new Date(isoDate), [isoDate]);
  // Calendar uses the wall-clock date from the ISO string (venue's local date), not the viewer's timezone.
  const [y, m, d] = isoDate.slice(0, 10).split("-").map(Number);
  const cells = useMemo(() => {
    const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay(); // 0 = Sunday
    const offset = (first + 6) % 7;
    const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
    return [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  }, [y, m]);
  const t = useCountdown(target.getTime());

  return (
    <section className={styles.section}>
      <SectionTitle kicker="Сохраните дату" title="Наш день" />

      <Reveal className={styles.card}>
        <Corner className={`${styles.corner} ${styles.cornerTL}`} />
        <Corner className={`${styles.corner} ${styles.cornerTR}`} />
        <Corner className={`${styles.corner} ${styles.cornerBL}`} />
        <Corner className={`${styles.corner} ${styles.cornerBR}`} />

        <p className={styles.calMonth}>
          {MONTHS[m - 1]} <span>{y}</span>
        </p>
        <div className={styles.calGrid}>
          {WEEKDAYS.map((w) => (
            <span key={w} className={styles.calWeekday}>
              {w}
            </span>
          ))}
          {cells.map((day, i) => (
            <motion.span
              key={i}
              className={`${styles.calDay} ${day === d ? styles.calDayActive : ""}`}
              initial={{ opacity: 0, scale: 0.5 }}
              whileInView={{ opacity: day ? 1 : 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.015, duration: 0.4 }}
            >
              {day === d ? (
                <>
                  <motion.svg
                    className={styles.calHeart}
                    viewBox="0 0 24 24"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
                    aria-hidden
                  >
                    <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.7 4.5c2.1 0 3.7 1.2 5.3 3.1 1.6-1.9 3.2-3.1 5.3-3.1 3.7 0 5.8 3.9 4.3 7.3C19.5 16.4 12 21 12 21z" />
                  </motion.svg>
                  <span>{day}</span>
                </>
              ) : (
                day
              )}
            </motion.span>
          ))}
        </div>

        <div className={styles.timeBadge}>
          <span>Начало в</span>
          <strong>{time}</strong>
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <p className={styles.countdownTitle}>{t.done ? "Этот день настал!" : "До торжества осталось"}</p>
        {!t.done && (
          <div className={styles.countdown}>
            <TimeUnit value={t.days} label={plural(t.days, ["день", "дня", "дней"])} />
            <span className={styles.timeSep}>:</span>
            <TimeUnit value={t.hours} label={plural(t.hours, ["час", "часа", "часов"])} />
            <span className={styles.timeSep}>:</span>
            <TimeUnit value={t.minutes} label={plural(t.minutes, ["минута", "минуты", "минут"])} />
            <span className={styles.timeSep}>:</span>
            <TimeUnit value={t.seconds} label={plural(t.seconds, ["секунда", "секунды", "секунд"])} />
          </div>
        )}
      </Reveal>

      <Reveal delay={0.2}>
        <div className={styles.notice}>
          <span className={styles.noticeIcon}>◆</span>
          <span>Просим без опозданий</span>
          <span className={styles.noticeIcon}>◆</span>
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Venue                                                                */
/* ------------------------------------------------------------------ */

export function VenueSection({ venue, date, time }: { venue: VenueInfo; date: string; time: string }) {
  return (
    <section className={styles.section}>
      <SectionTitle kicker="Место проведения" title="Где нас найти" />

      <Reveal className={`${styles.card} ${styles.venueCard}`}>
        <Corner className={`${styles.corner} ${styles.cornerTL}`} />
        <Corner className={`${styles.corner} ${styles.cornerTR}`} />
        <Corner className={`${styles.corner} ${styles.cornerBL}`} />
        <Corner className={`${styles.corner} ${styles.cornerBR}`} />

        <motion.div
          className={styles.venueIcon}
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <svg viewBox="0 0 64 64" fill="none" stroke="url(#goldStroke)" strokeWidth="1.6" aria-hidden>
            <path d="M8 56 H56 M12 56 V30 M52 56 V30 M20 56 V34 M44 56 V34 M28 56 V40 H36 V56" />
            <path d="M6 30 L32 10 L58 30 Z" />
            <circle cx="32" cy="22" r="3.5" />
            <path d="M32 4 V10" />
          </svg>
        </motion.div>

        <h3 className={styles.venueName}>{venue.name}</h3>
        {(venue.address || venue.city) && (
          <p className={styles.venueAddress}>{[venue.city, venue.address].filter(Boolean).join(", ")}</p>
        )}
        <p className={styles.venueWhen}>
          {date} · {time}
        </p>

        <div className={styles.venueButtons}>
          {venue.gisMapUrl && (
            <a className={styles.btnGold} href={venue.gisMapUrl} target="_blank" rel="noreferrer">
              Открыть в 2GIS
            </a>
          )}
          {venue.yandexMapUrl && (
            <a className={styles.btnOutline} href={venue.yandexMapUrl} target="_blank" rel="noreferrer">
              Яндекс Карты
            </a>
          )}
        </div>
      </Reveal>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Message from the couple                                              */
/* ------------------------------------------------------------------ */

export function MessageSection({ text, photo }: { text: string; photo: string }) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-18%", "18%"]);

  return (
    <section ref={ref} className={styles.message}>
      <div className={styles.messageWrapMask} aria-hidden>
        <motion.div className={styles.messageBg} style={{ y: bgY, backgroundImage: `url(${photo})` }} />
      </div>
      <div className={styles.messageInner}>
        <Reveal>
          <span className={styles.quoteMark}>“</span>
        </Reveal>
        <WordReveal text={text} className={styles.messageText} />
        <Reveal delay={0.3}>
          <Divider light />
        </Reveal>
      </div>
    </section>
  );
}

export { SectionTitle };
