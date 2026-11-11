import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SectionTitle } from "./Sections";
import { Reveal } from "./Reveal";
import { Corner } from "./Ornaments";
import type { RsvpContact } from "../types";
import styles from "./invitation.module.css";

type Attendance = "yes" | "no";

interface RsvpProps {
  contacts: RsvpContact[];
  groom: string;
  bride: string;
  date: string;
}

const buildMessage = (p: {
  name: string;
  attendance: Attendance;
  guests: number;
  wish: string;
  groom: string;
  bride: string;
  date: string;
}) => {
  const lines = [
    `💍 Ответ на приглашение на свадьбу ${p.groom} и ${p.bride} (${p.date})`,
    "",
    `👤 Имя: ${p.name}`,
    p.attendance === "yes"
      ? `✅ С радостью приду${p.guests > 1 ? ` — нас будет ${p.guests}` : ""}`
      : "😔 К сожалению, не смогу прийти",
  ];
  if (p.wish.trim()) lines.push("", `💌 Пожелание: ${p.wish.trim()}`);
  return lines.join("\n");
};

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden>
    <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.5-.1-.7.1-.2.3-.8.9-.9 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.4s1 2.8 1.2 3c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2z" />
  </svg>
);

export default function Rsvp({ contacts, groom, bride, date }: RsvpProps) {
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [guests, setGuests] = useState(1);
  const [wish, setWish] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const send = (contact: RsvpContact) => {
    if (!name.trim()) return setError("Пожалуйста, укажите ваше имя");
    if (!attendance) return setError("Пожалуйста, выберите, сможете ли вы прийти");
    setError("");

    const text = buildMessage({ name: name.trim(), attendance, guests, wish, groom, bride, date });
    const digits = contact.phone.replace(/\D/g, "");
    const url = `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
    // In-app browsers (Instagram, Telegram) often block popups — fall back to same-tab navigation.
    const win = window.open(url, "_blank");
    if (win) win.opener = null;
    else window.location.href = url;
    setSent(true);
  };

  return (
    <section className={styles.section} id="rsvp">
      <SectionTitle kicker="Будем ждать ответа" title="Вы придёте?" />

      <Reveal className={`${styles.card} ${styles.rsvpCard}`}>
        <Corner className={`${styles.corner} ${styles.cornerTL}`} />
        <Corner className={`${styles.corner} ${styles.cornerTR}`} />
        <Corner className={`${styles.corner} ${styles.cornerBL}`} />
        <Corner className={`${styles.corner} ${styles.cornerBR}`} />

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div
              key="thanks"
              className={styles.thanks}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.svg
                viewBox="0 0 52 52"
                className={styles.thanksIcon}
                fill="none"
                stroke="url(#goldStroke)"
                strokeWidth="2"
                aria-hidden
              >
                <motion.circle cx="26" cy="26" r="24" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9 }} />
                <motion.path
                  d="M15 27 l7 7 l15 -16"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                />
              </motion.svg>
              <p className={styles.thanksTitle}>Спасибо!</p>
              <p className={styles.thanksText}>
                Откроется WhatsApp с готовым сообщением — просто нажмите «Отправить».
              </p>
              <button type="button" className={styles.btnOutline} onClick={() => setSent(false)}>
                Изменить ответ
              </button>
            </motion.div>
          ) : (
            <motion.form key="form" className={styles.form} onSubmit={(e) => e.preventDefault()} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className={styles.formNote}>Пожалуйста, подтвердите своё присутствие</p>

              <label className={styles.field}>
                <span>Ваше имя и фамилия</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Например: Айбек Асанов"
                  autoComplete="name"
                  maxLength={80}
                />
              </label>

              <div className={styles.choice} role="radiogroup" aria-label="Присутствие">
                {(
                  [
                    ["yes", "С радостью приду"],
                    ["no", "Не смогу прийти"],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    role="radio"
                    aria-checked={attendance === value}
                    className={`${styles.choiceBtn} ${attendance === value ? styles.choiceActive : ""}`}
                    onClick={() => setAttendance(value)}
                  >
                    {attendance === value && (
                      <motion.span layoutId="choiceGlow" className={styles.choiceGlow} transition={{ type: "spring", stiffness: 400, damping: 32 }} />
                    )}
                    <span className={styles.choiceLabel}>{label}</span>
                  </button>
                ))}
              </div>

              <AnimatePresence initial={false}>
                {attendance === "yes" && (
                  <motion.div
                    className={styles.field}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    style={{ overflow: "hidden" }}
                  >
                    <span>Сколько вас будет</span>
                    <div className={styles.stepper}>
                      <button type="button" onClick={() => setGuests((g) => Math.max(1, g - 1))} aria-label="Меньше">
                        −
                      </button>
                      <AnimatePresence mode="popLayout" initial={false}>
                        <motion.strong key={guests} initial={{ y: -12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 12, opacity: 0 }}>
                          {guests}
                        </motion.strong>
                      </AnimatePresence>
                      <button type="button" onClick={() => setGuests((g) => Math.min(10, g + 1))} aria-label="Больше">
                        +
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <label className={styles.field}>
                <span>Пожелание молодым (необязательно)</span>
                <textarea value={wish} onChange={(e) => setWish(e.target.value)} rows={3} maxLength={500} placeholder="Ваши тёплые слова…" />
              </label>

              <AnimatePresence>
                {error && (
                  <motion.p className={styles.formError} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <div className={styles.sendTo}>
                <span className={styles.sendToTitle}>Кому отправить ответ в WhatsApp?</span>
                <div className={styles.sendToButtons}>
                  {contacts.map((c) => (
                    <motion.button
                      key={c.phone}
                      type="button"
                      className={`${styles.btnGold} ${styles.submit}`}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => send(c)}
                    >
                      <WhatsAppIcon />
                      <span className={styles.sendLabel}>
                        <strong>{c.label}</strong>
                        <small>{c.name}</small>
                      </span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </Reveal>
    </section>
  );
}
