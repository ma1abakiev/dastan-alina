import { WeddingData } from "./types";
import photos from "./photos.json";

/**
 * All invitation content lives here. WhatsApp numbers for RSVP are in `rsvpContacts`
 * (international format, digits only, e.g. 996700123456).
 */
export const weddingData: WeddingData = {
  eventType: "Свадьба",
  groomName: "Дастан",
  brideName: "Алина",
  date: "26 ноября 2026",
  // Bishkek is UTC+6
  isoDate: "2026-11-26T18:00:00+06:00",
  time: "18:00",
  venue: {
    name: "Ресторан «President City Hall»",
    address: "",
    city: "Бишкек",
    gisMapUrl: "https://2gis.kg/bishkek/geo/70000001033577160",
  },
  storyText:
    "Для нас самое главное — разделить этот незабываемый день с вами! Ваше присутствие и добрые пожелания сделают наш праздник по-настоящему особенным и тёплым. Будем счастливы видеть вас!",
  musicUrl: "/music.mp3",
  gallery: photos.map((p) => p.src),
  rsvpContacts: [
    { label: "Жениху", name: "Дастан", phone: "996500147741" },
    { label: "Невесте", name: "Алина", phone: "996770250205" },
  ],
};

// Photos used outside the gallery.
export const featuredPhotos = {
  heroPortrait: "/photos/02.webp",
  heroLandscape: "/photos/02.webp",
  invite: "/photos/06.webp",
  message: "/photos/03.webp",
};

// Gallery order: the similar «Кыз узатуу» shots (5, 7, 8) are kept apart in the masonry.
const GALLERY_ORDER = [2, 5, 1, 6, 4, 7, 3, 8];

export const galleryPhotos = GALLERY_ORDER.map((n) => photos[n - 1]).filter(Boolean);
