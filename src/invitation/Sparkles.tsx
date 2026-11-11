import { useEffect, useRef } from "react";
import styles from "./invitation.module.css";

interface Particle {
  x: number;
  y: number;
  r: number;
  vx: number;
  vy: number;
  life: number;
  twinkle: number;
  petal: boolean;
  angle: number;
  spin: number;
}

/** Full-screen canvas of drifting gold dust and a few falling petals. Lightweight and paused when hidden. */
export default function Sparkles({ density = 1 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let w = 0;
    let h = 0;
    let raf = 0;
    let particles: Particle[] = [];
    // Lower resolution + fewer particles keep scrolling smooth on phones.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    // Pre-rendered glow sprite: drawing an image is far cheaper than building a gradient per particle per frame.
    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 64;
    const sctx = sprite.getContext("2d")!;
    const sg = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    sg.addColorStop(0, "rgba(255,240,200,1)");
    sg.addColorStop(0.3, "rgba(233,201,131,0.8)");
    sg.addColorStop(1, "rgba(217,180,106,0)");
    sctx.fillStyle = sg;
    sctx.fillRect(0, 0, 64, 64);

    const spawn = (initial: boolean): Particle => {
      const petal = Math.random() < 0.18;
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : petal ? -20 : h + 10,
        r: petal ? 4 + Math.random() * 4 : 0.6 + Math.random() * 1.8,
        vx: (Math.random() - 0.5) * (petal ? 0.6 : 0.2),
        vy: petal ? 0.35 + Math.random() * 0.5 : -(0.15 + Math.random() * 0.45),
        life: Math.random() * Math.PI * 2,
        twinkle: 0.01 + Math.random() * 0.03,
        petal,
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.03,
      };
    };

    const resize = () => {
      // Mobile browsers fire resize whenever the URL bar collapses while scrolling — ignore those small height changes.
      if (w && window.innerWidth === w && Math.abs(window.innerHeight - h) < 160) return;
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(Math.min(70, (w * h) / 16000) * density);
      particles = Array.from({ length: count }, () => spawn(true));
    };

    const drawPetal = (p: Particle, alpha: number) => {
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = alpha * 0.55;
      ctx.fillStyle = "#e6bfae";
      ctx.beginPath();
      ctx.moveTo(0, -p.r);
      ctx.bezierCurveTo(p.r, -p.r * 0.6, p.r * 0.7, p.r, 0, p.r);
      ctx.bezierCurveTo(-p.r * 0.7, p.r, -p.r, -p.r * 0.6, 0, -p.r);
      ctx.fill();
      ctx.restore();
    };

    const tick = () => {
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.life += p.twinkle;
        p.x += p.vx + Math.sin(p.life) * (p.petal ? 0.5 : 0.12);
        p.y += p.vy;
        p.angle += p.spin;
        const alpha = 0.35 + 0.65 * Math.abs(Math.sin(p.life));

        if (p.petal) {
          drawPetal(p, alpha);
          if (p.y > h + 20) particles[i] = spawn(false);
        } else {
          ctx.globalAlpha = alpha;
          const size = p.r * 8;
          ctx.drawImage(sprite, p.x - size / 2, p.y - size / 2, size, size);
          if (p.y < -10) particles[i] = spawn(false);
        }
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(tick);
    };

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden) raf = requestAnimationFrame(tick);
    };

    resize();
    raf = requestAnimationFrame(tick);
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [density]);

  return <canvas ref={ref} className={styles.sparkles} aria-hidden />;
}
