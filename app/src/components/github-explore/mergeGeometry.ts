import { BufferGeometry, Color, Float32BufferAttribute } from 'three'

interface ColoredPart {
  geometry: BufferGeometry
  color: Color
}

/**
 * Flattens several colored primitive geometries (already positioned/rotated
 * via their own `.translate()`/`.rotateY()` calls) into one indexed
 * geometry with per-vertex color, so a multi-part shape — a house's walls
 * plus its roof, say — costs one draw call instead of one per part. With 39
 * of these on screen at once, every mesh saved is real frame time; a
 * `three/examples` geometry-merge util would do the same thing, but this
 * keeps the dependency surface at zero.
 */
export function mergeColoredGeometries(parts: ColoredPart[]): BufferGeometry {
  const positions: number[] = []
  const normals: number[] = []
  const colors: number[] = []
  const indices: number[] = []
  let vertexOffset = 0

  for (const { geometry, color } of parts) {
    const pos = geometry.attributes.position
    const norm = geometry.attributes.normal

    for (let i = 0; i < pos.count; i++) {
      positions.push(pos.getX(i), pos.getY(i), pos.getZ(i))
      normals.push(norm.getX(i), norm.getY(i), norm.getZ(i))
      colors.push(color.r, color.g, color.b)
    }

    const index = geometry.index
    if (index) {
      for (let i = 0; i < index.count; i++) indices.push(index.getX(i) + vertexOffset)
    } else {
      for (let i = 0; i < pos.count; i++) indices.push(i + vertexOffset)
    }
    vertexOffset += pos.count
  }

  const merged = new BufferGeometry()
  merged.setAttribute('position', new Float32BufferAttribute(positions, 3))
  merged.setAttribute('normal', new Float32BufferAttribute(normals, 3))
  merged.setAttribute('color', new Float32BufferAttribute(colors, 3))
  merged.setIndex(indices)
  return merged
}
