/** Warms the browser cache with images, a couple at a time, so sections appear instantly when scrolled to. */
export function preloadImages(urls: string[], concurrency = 3): () => void {
  let cancelled = false;
  const queue = [...new Set(urls)].filter(Boolean);
  const live = new Set<HTMLImageElement>();

  const next = () => {
    if (cancelled) return;
    const url = queue.shift();
    if (!url) return;
    const img = new Image();
    img.decoding = "async";
    live.add(img);
    const done = () => {
      live.delete(img);
      next();
    };
    img.onload = done;
    img.onerror = done;
    img.src = url;
  };

  for (let i = 0; i < concurrency; i++) next();
  return () => {
    cancelled = true;
    live.forEach((img) => {
      img.onload = null;
      img.onerror = null;
    });
  };
}
