import { mkdir } from 'node:fs/promises'
import sharp from 'sharp'

const SRC = 'public/icon.svg'
const OUT = 'public/icons'

const targets = [
  { file: 'icon-192.png', size: 192 },
  { file: 'icon-512.png', size: 512 },
  // Maskable: the glass must stay inside the safe circle, so shrink it on a full-bleed canvas.
  { file: 'maskable-512.png', size: 512, padding: 100 },
]

await mkdir(OUT, { recursive: true })

for (const { file, size, padding = 0 } of targets) {
  const inner = size - padding * 2
  const art = await sharp(SRC).resize(inner, inner).png().toBuffer()
  await sharp({
    create: { width: size, height: size, channels: 4, background: '#0F0D0C' },
  })
    .composite([{ input: art, top: padding, left: padding }])
    .png()
    .toFile(`${OUT}/${file}`)
  console.log(`${OUT}/${file}`)
}
