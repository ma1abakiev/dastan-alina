# Дастан & Алина — свадебное приглашение

Отдельный статический сайт (Vite + React + framer-motion). Позже переносится в toybox.kg как шаблон:
компонент `src/invitation/InvitationTemplate.tsx` принимает `data` в формате `WeddingData`.

## Настройка

Все тексты, дата, место и **номера WhatsApp** (жених и невеста, гость выбирает кому отправить ответ) — в [`src/data.ts`](src/data.ts).
Номера указываются в `rsvpContacts` цифрами в международном формате, например `996700123456`.

Музыка: `public/music.mp3` уже обрезан (тот же трек, что у Ислам & Нургуль), поэтому плеер не перематывает трек и стартует всегда одинаково.

Фото: исходники (включая HEIC с iPhone) лежат в папке `photos-raw/`; после изменений выполните `npm run photos` — скрипт повернёт,
сожмёт их в WebP в `public/photos/` и обновит `src/photos.json`. Какие фото в шапке/секциях — `featuredPhotos`, порядок в галерее — `GALLERY_ORDER` в `src/data.ts`.

## Запуск

```bash
npm install
npm run dev
```

## Деплой (бесплатно)

```bash
npm run build
```

Готовый сайт — папка `dist/`.

- **Netlify Drop**: откройте https://app.netlify.com/drop и перетащите папку `dist`.
- **Vercel**: `npx vercel` в этой папке (Framework: Vite, Output: `dist`).
- **Cloudflare Pages**: новый проект → Upload assets → папка `dist`.
