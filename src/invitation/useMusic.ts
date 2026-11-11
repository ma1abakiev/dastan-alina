import { useCallback, useEffect, useRef, useState } from "react";

const GESTURES = ["pointerdown", "touchend", "click", "keydown"] as const;

/**
 * Background music that survives real-world browsers (iOS Safari, in-app browsers of Telegram/Instagram/WhatsApp):
 * - the track is pre-trimmed (no seeking → never "starts from the wrong place"), looped natively;
 * - the download starts only after the page has finished loading, so it doesn't fight the photos for bandwidth —
 *   but never by calling `load()` once playback was requested (that would reset the element and silence it);
 * - play() is called synchronously from the user's tap; while the guest wants music and it isn't playing,
 *   every further tap/click retries, and so do `canplay`, network errors and returning to the tab;
 * - pauses while the tab is hidden and resumes afterwards.
 */
export function useMusic(url?: string) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const wantPlaying = useRef(false);
  const ensureRef = useRef<() => void>(() => undefined);
  const playingRef = useRef(false);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!url) return;
    const audio = new Audio();
    audio.loop = true;
    audio.preload = "none";
    audio.setAttribute("playsinline", "");
    audio.src = url;
    audioRef.current = audio;

    let gestureArmed = false;
    const disarmGestures = () => {
      if (!gestureArmed) return;
      gestureArmed = false;
      GESTURES.forEach((e) => window.removeEventListener(e, onGesture, true));
    };
    const armGestures = () => {
      if (gestureArmed) return;
      gestureArmed = true;
      GESTURES.forEach((e) => window.addEventListener(e, onGesture, { capture: true, passive: true }));
    };

    // Try to (re)start playback if the guest wants music. Safe to call any number of times.
    const ensure = () => {
      if (!wantPlaying.current || document.hidden || !audio.paused) return;
      if (audio.error) {
        // A failed download leaves the element dead; give it a fresh start.
        audio.src = url;
        audio.load();
      }
      const p = audio.play();
      if (p) p.catch(() => armGestures());
    };
    ensureRef.current = ensure;

    function onGesture() {
      if (!wantPlaying.current || !audio.paused) disarmGestures();
      else ensure();
    }

    const onPlaying = () => {
      playingRef.current = true;
      setPlaying(true);
      disarmGestures();
    };
    const onPause = () => {
      playingRef.current = false;
      setPlaying(false);
    };
    audio.addEventListener("playing", onPlaying);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("canplay", ensure);
    audio.addEventListener("error", armGestures);

    // Warm the cache once the page itself is ready — only if nothing has touched the audio yet.
    let warmTimer = 0;
    const warm = () => {
      warmTimer = window.setTimeout(() => {
        if (audio.preload === "none" && !wantPlaying.current && audio.paused) {
          audio.preload = "auto";
          audio.load();
        }
      }, 1200);
    };
    if (document.readyState === "complete") warm();
    else window.addEventListener("load", warm, { once: true });

    const onVisibility = () => {
      if (document.hidden) audio.pause();
      else ensure();
    };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pageshow", ensure);

    return () => {
      window.clearTimeout(warmTimer);
      window.removeEventListener("load", warm);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pageshow", ensure);
      disarmGestures();
      audio.removeEventListener("playing", onPlaying);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("canplay", ensure);
      audio.removeEventListener("error", armGestures);
      audio.pause();
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
      ensureRef.current = () => undefined;
    };
  }, [url]);

  const play = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    wantPlaying.current = true;
    // Marks the element as "in use" so the cache-warming timer never calls load() on it.
    audio.preload = "auto";
    ensureRef.current();
  }, []);

  const pause = useCallback(() => {
    wantPlaying.current = false;
    audioRef.current?.pause();
  }, []);

  // Decide by what the guest hears ("playing" event), not by audio.paused: a tap on the button may already
  // have restarted the music via the gesture retry a moment earlier, and must not then switch it off.
  const toggle = useCallback(() => {
    if (playingRef.current) pause();
    else play();
  }, [play, pause]);

  return { playing, play, pause, toggle };
}
