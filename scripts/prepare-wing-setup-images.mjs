import { mkdir, stat } from 'node:fs/promises'
import { resolve } from 'node:path'
import sharp from 'sharp'

const sourceDirectory = process.argv[2]
if (!sourceDirectory) throw new Error('Pass the directory containing the four original Wing PNG photos.')

const outputDirectory = resolve('public/studio-setups/the-wing')
await mkdir(outputDirectory, { recursive: true })

const photos = [
  ['1 black chair.PNG', 'one-black-chair.webp'],
  ['1 brown chair.PNG', 'one-brown-chair.webp'],
  ['two brown chairs.PNG', 'two-brown-chairs.webp'],
  ['two black chairs.PNG', 'two-black-chairs.webp'],
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
