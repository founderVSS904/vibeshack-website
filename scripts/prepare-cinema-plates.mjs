import { resolve } from 'node:path'
import sharp from 'sharp'

// Web derivatives of the checked-in Blender plates. Keep the PNG masters,
// 1800x800 geometry, alpha, and matching lighting masks unchanged.
const directory = resolve('public/studio-videos/cinema/runtime-v017')
for (const name of ['theater_idle', 'theater_playing_base']) {
  const result = await sharp(resolve(directory, `${name}.png`))
    .webp({ quality: 95, alphaQuality: 100, effort: 6 })
    .toFile(resolve(directory, `${name}-q95.webp`))
  console.log(`${name}: ${result.width}x${result.height}, ${result.size} bytes`)
}
