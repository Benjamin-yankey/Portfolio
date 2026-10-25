import variants from '../content/image-variants.json'

interface Variant {
  width: number
  small: string
  smallWidth: number
}

// Written by scripts/make-image-variants.mjs.
const table: Record<string, Variant> = variants

/**
 * src/srcSet/sizes for an image shown at thumbnail size: browsers pick the
 * 800px copy unless the slot (or a high-DPI screen) needs the full one.
 * Images without a copy — e.g. fresh CMS uploads — just get `src`.
 */
export function responsiveImage(src: string | undefined, sizes: string) {
  const variant = src ? table[src] : undefined
  if (!variant) return { src }
  return {
    src,
    srcSet: `${variant.small} ${variant.smallWidth}w, ${src} ${variant.width}w`,
    sizes,
  }
}
