export interface Point {
  x: number
  z: number
}

export interface Obstacle extends Point {
  radius: number
}

export interface FieldBounds {
  minX: number
  maxX: number
  minZ: number
  maxZ: number
  centerX: number
  centerZ: number
  width: number
  length: number
}

export interface RoadSegment {
  a: Point
  b: Point
  width: number
}

export const GRID_COLS = 7
export const GRID_SPACING = 5.5
export const HOUSE_RADIUS = 0.62
export const TREE_RADIUS = 0.38
export const CAR_COLLISION_RADIUS = 0.75

/** A grid field rather than a single path — dozens of repos strung along
 *  one zigzag would make a corridor several hundred units long; a grid
 *  keeps the field roughly square, so "make it bigger" reads as more room
 *  to drive around in rather than a longer straight line. */
export function buildGridPositions(count: number): Point[] {
  return Array.from({ length: count }, (_, i) => {
    const row = Math.floor(i / GRID_COLS)
    const col = i % GRID_COLS
    return {
      x: (col - (GRID_COLS - 1) / 2) * GRID_SPACING,
      z: -(row + 1) * GRID_SPACING - 2,
    }
  })
}

export function computeFieldBounds(markers: Point[]): FieldBounds {
  const xs = markers.map((m) => m.x)
  const zs = markers.map((m) => m.z)
  const minX = Math.min(0, ...xs) - 4
  const maxX = Math.max(0, ...xs) + 4
  const minZ = Math.min(...zs) - 4
  const maxZ = Math.max(0, ...zs) + 4
  return {
    minX,
    maxX,
    minZ,
    maxZ,
    centerX: (minX + maxX) / 2,
    centerZ: (minZ + maxZ) / 2,
    width: maxX - minX,
    length: maxZ - minZ,
  }
}

/** A real grid: one road per row of houses (running the width of the
 *  field) *and* one per column (running the length of it), so driving
 *  anywhere in the field keeps a road within reach rather than only along
 *  a single "main street." Ribbons overlap at intersections rather than
 *  mitering into real corners — at this scale, on a hilly ground, the
 *  overlap reads as a crossroads rather than a visible seam. Rows/columns
 *  are re-derived from the marker count rather than passed in, so this
 *  always matches buildGridPositions's own layout. */
export function buildRoadNetwork(markerCount: number, bounds: FieldBounds): RoadSegment[] {
  const rows = Math.ceil(markerCount / GRID_COLS)
  const width = 1.7
  const segments: RoadSegment[] = []

  for (let row = 0; row < rows; row++) {
    const z = -(row + 1) * GRID_SPACING - 2
    segments.push({ a: { x: bounds.minX + 0.5, z }, b: { x: bounds.maxX - 0.5, z }, width })
  }

  for (let col = 0; col < GRID_COLS; col++) {
    const x = (col - (GRID_COLS - 1) / 2) * GRID_SPACING
    segments.push({ a: { x, z: bounds.minZ + 0.5 }, b: { x, z: bounds.maxZ - 0.5 }, width })
  }

  return segments
}

/** Lamp posts spaced along every road segment, offset to one side so they
 *  don't sit in the middle of the road. The grid now has roughly twice as
 *  many segments as the old row-only ladder, so the interval is wider than
 *  it needs to be per-segment — otherwise the total lamp count doubles
 *  along with it. */
export function buildStreetlightPositions(roads: RoadSegment[]): Point[] {
  const interval = 7
  const lights: Point[] = []

  for (const road of roads) {
    const dx = road.b.x - road.a.x
    const dz = road.b.z - road.a.z
    const length = Math.hypot(dx, dz)
    if (length < 0.01) continue
    const dirX = dx / length
    const dirZ = dz / length
    const perpX = -dirZ
    const perpZ = dirX
    const offset = road.width / 2 + 0.45
    const count = Math.max(1, Math.floor(length / interval))

    for (let i = 1; i < count; i++) {
      const t = i / count
      const cx = road.a.x + dx * t
      const cz = road.a.z + dz * t
      lights.push({ x: cx + perpX * offset, z: cz + perpZ * offset })
    }
  }

  return lights
}

/** Scattered trees, kept clear of the houses — computed once from a seeded
 *  attempt loop rather than a fixed pattern, so the village doesn't look
 *  like a spreadsheet. */
export function buildTreePositions(bounds: FieldBounds, houses: Point[], count: number): Obstacle[] {
  const trees: Obstacle[] = []
  let attempts = 0

  while (trees.length < count && attempts < count * 12) {
    attempts++
    const x = bounds.minX + Math.random() * bounds.width
    const z = bounds.minZ + Math.random() * bounds.length
    const tooCloseToHouse = houses.some((h) => Math.hypot(h.x - x, h.z - z) < 1.9)
    const tooCloseToTree = trees.some((t) => Math.hypot(t.x - x, t.z - z) < 1.3)
    if (tooCloseToHouse || tooCloseToTree) continue
    trees.push({ x, z, radius: TREE_RADIUS })
  }

  return trees
}
