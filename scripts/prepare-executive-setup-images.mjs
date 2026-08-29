import { mkdir, stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import sharp from 'sharp'

const sourceDirectory = process.argv[2]
if (!sourceDirectory) throw new Error('Pass the directory containing the three original Executive photos.')

const outputDirectory = resolve('public/studio-setups/the-executive')
await mkdir(outputDirectory, { recursive: true })

const photos = [
  ['1 black office chair setup.PNG', 'one-office-chair-desk.webp'],
  ['two black chair office setup.jpg', 'two-office-chairs-desk.webp'],
  ['3 black chairs.PNG', 'three-black-armchairs.webp'],
]

for (const [sourceName, outputName] of photos) {
  const outputPath = resolve(outputDirectory, outputName)
  if (await stat(outputPath).catch(() => null)) throw new Error(`Output already exists: ${outputName}`)
  const result = await sharp(resolve(sourceDirectory, sourceName))
    .rotate()
    .webp({ quality: 90, effort: 5 })
    .toFile(outputPath)
  console.log(`${outputName}: ${result.width}x${result.height}, ${result.size} bytes`)
}
