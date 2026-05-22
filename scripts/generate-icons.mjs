import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';

await mkdir('public', { recursive: true });

const faviconSrc = 'src/assets/favicon-source.png';
const headshotSrc = 'src/assets/headshot.png';
const cream = { r: 255, g: 251, b: 244, alpha: 1 };

await sharp(faviconSrc).resize(32, 32, { fit: 'contain', background: cream }).toFile('public/favicon-32.png');
await sharp(faviconSrc).resize(192, 192, { fit: 'contain', background: cream }).toFile('public/favicon-192.png');
await sharp(faviconSrc).resize(180, 180, { fit: 'contain', background: cream }).toFile('public/apple-touch-icon.png');

await sharp(headshotSrc)
  .resize(630, 630, { fit: 'contain', background: cream })
  .extend({ left: 285, right: 285, background: cream })
  .flatten({ background: cream })
  .toFile('public/og-image.png');

console.log('Generated: favicon-32.png, favicon-192.png, apple-touch-icon.png, og-image.png');
