// Makes an 800px-wide copy of every image in public/images/projects/ that's
// wider than that, and records both widths in src/content/image-variants.json
// so thumbnails can use srcset. Uses macOS `sips`; run it after adding images:
//   node scripts/make-image-variants.mjs
import { execFileSync } from 'node:child_process'
import { readdirSync, writeFileSync } from 'node:fs'

const DIR = 'public/images/projects'
const PUBLIC_PATH = '/Portfolio/images/projects'
const SMALL = 800

function width(file) {
  const out = execFileSync('sips', ['-g', 'pixelWidth', file], { encoding: 'utf8' })
  return Number(out.match(/pixelWidth: (\d+)/)[1])
}

const manifest = {}
for (const name of readdirSync(DIR).sort()) {
  if (!/\.jpe?g$/i.test(name) || name.includes(`-${SMALL}.`)) continue
  const file = `${DIR}/${name}`
  const full = width(file)
  if (full <= SMALL) continue
  const smallName = name.replace(/(\.jpe?g)$/i, `-${SMALL}$1`)
  execFileSync('sips', ['--resampleWidth', String(SMALL), '-s', 'formatOptions', '78', file, '--out', `${DIR}/${smallName}`], {
    stdio: 'ignore',
  })
  manifest[`${PUBLIC_PATH}/${name}`] = { width: full, small: `${PUBLIC_PATH}/${smallName}`, smallWidth: SMALL }
}

writeFileSync('src/content/image-variants.json', `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`${Object.keys(manifest).length} images have an ${SMALL}px variant`)
