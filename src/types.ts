// Same shape as `WeddingData` in toybox.kg (frontend/src/types/wedding.ts), so this invitation
// can later be dropped into the platform as a template without changes.
export interface VenueInfo {
  name: string;
  address: string;
  city?: string;
  yandexMapUrl?: string;
  gisMapUrl?: string;
}

export interface WeddingData {
  eventType: string;
  groomName: string;
  brideName: string;
  date: string;
  isoDate: string;
  time: string;
  venue: VenueInfo;
  storyText?: string;
  musicUrl?: string;
  gallery?: string[];
  contactPhone?: string;
  /** Who a guest can send their RSVP to (WhatsApp). The guest picks one. */
  rsvpContacts?: RsvpContact[];
}

export interface RsvpContact {
  /** Short label on the button, e.g. "Жениху" */
  label: string;
  /** Name shown under the label */
  name: string;
  /** International format, digits only */
  phone: string;
}

export interface GalleryPhoto {
  src: string;
  thumb: string;
  w: number;
  h: number;
}
