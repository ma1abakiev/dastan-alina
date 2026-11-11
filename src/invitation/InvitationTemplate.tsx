import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import Intro from "./Intro";
import Hero from "./Hero";
import ScrollOrnament from "./ScrollOrnament";
import Sparkles from "./Sparkles";
import Gallery from "./Gallery";
import Rsvp from "./Rsvp";
import MusicToggle from "./MusicToggle";
import { playOpeningSound } from "./sounds";
import { useMusic } from "./useMusic";
import { preloadImages } from "./preload";
import { InviteSection, DateSection, VenueSection, MessageSection } from "./Sections";
import { GoldDefs, Rosette } from "./Ornaments";
import { Reveal, SplitText } from "./Reveal";
import type { WeddingData, GalleryPhoto } from "../types";
import styles from "./invitation.module.css";

export interface FeaturedPhotos {
  heroPortrait: string;
  heroLandscape: string;
  invite: string;
  message: string;
}

interface Props {
  data: WeddingData;
  photos: GalleryPhoto[];
  featured: FeaturedPhotos;
}

export default function InvitationTemplate({ data, photos, featured }: Props) {
  const [opened, setOpened] = useState(false);
  const [introGone, setIntroGone] = useState(false);
  const { playing, play, toggle: toggleMusic } = useMusic(data.musicUrl);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });

  // While the guest is still looking at the intro doors, fetch every image so the page opens instantly.
  useEffect(() => {
    let stop = () => {};
    const start = () => {
      stop = preloadImages([featured.invite, featured.message, ...photos.map((p) => p.thumb)]);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      stop();
    };
  }, [featured, photos]);

  // Keep the page locked behind the intro doors until they have opened.
  useEffect(() => {
    document.body.classList.toggle("is-locked", !introGone);
    return () => document.body.classList.remove("is-locked");
  }, [introGone]);

  const [, mm, dd] = data.isoDate.slice(0, 10).split("-");
  const dateShort = `${dd} · ${mm} · ${data.isoDate.slice(0, 4)}`;

  return (
    <div className={styles.page}>
      <GoldDefs />
      <div className={styles.backdrop} aria-hidden />

      {!introGone && (
        <Intro
          groom={data.groomName}
          bride={data.brideName}
          dateShort={dateShort}
          onOpen={() => {
            setOpened(true);
            play();
            playOpeningSound();
          }}
          onDone={() => setIntroGone(true)}
        />
      )}

      {opened && (
        <>
          <motion.div className={styles.progress} style={{ scaleX: progress }} aria-hidden />
          <ScrollOrnament />
          <Sparkles />
          <MusicToggle playing={playing} onToggle={toggleMusic} />

          <main className={styles.main}>
            <Hero
              groom={data.groomName}
              bride={data.brideName}
              date={data.date}
              time={data.time}
              portraitSrc={featured.heroPortrait}
              landscapeSrc={featured.heroLandscape}
            />
            <InviteSection photo={featured.invite} groom={data.groomName} bride={data.brideName} />
            <DateSection isoDate={data.isoDate} time={data.time} />
            <MessageSection text={data.storyText || ""} photo={featured.message} />
            <VenueSection venue={data.venue} date={data.date} time={data.time} />
            <Gallery photos={photos} />
            <Rsvp contacts={data.rsvpContacts ?? []} groom={data.groomName} bride={data.brideName} date={data.date} />

            <footer className={styles.footer}>
              <Reveal>
                <motion.div
                  className={styles.footerRosette}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                >
                  <Rosette size={90} strokeWidth={1} draw />
                </motion.div>
              </Reveal>
              <Reveal>
                <p className={styles.footerKicker}>С любовью и уважением</p>
              </Reveal>
              <p className={styles.footerNames}>
                <SplitText text={`${data.groomName} и ${data.brideName}`} inView stagger={0.07} />
              </p>
              <Reveal delay={0.4}>
                <p className={styles.footerDate}>{dateShort}</p>
              </Reveal>
            </footer>
          </main>
        </>
      )}
    </div>
  );
}
