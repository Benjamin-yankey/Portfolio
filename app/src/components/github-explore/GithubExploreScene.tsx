import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  CapsuleGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DoubleSide,
  Float32BufferAttribute,
  PlaneGeometry,
  SphereGeometry,
  Vector3,
} from 'three'
import type { Group, Mesh } from 'three'
import type { GithubProject } from '../../data/githubProjects'
import { FrameRateGuard } from '../FrameRateGuard'
import { waveHeight } from '../explore/waveHeight'
import { lerp } from '../explore/roam'
import { createKeyState, type CarState, type KeyState } from './carState'
import { createVillagerState, type VillagerState } from './villagerState'
import { colorForIndex } from './palette'
import { mergeColoredGeometries } from './mergeGeometry'
import {
  buildGridPositions,
  buildRoadNetwork,
  buildStreetlightPositions,
  buildTreePositions,
  computeFieldBounds,
  CAR_COLLISION_RADIUS,
  HOUSE_RADIUS,
  type FieldBounds,
  type Obstacle,
  type Point,
  type RoadSegment,
} from './village'

const AMPLITUDE_SCALE = 2
const GROUND_LOW = '#3f8f52'
const GROUND_HIGH = '#c3e89a'
const ROOF_COLOR = '#8b5a3c'
const TRUNK_COLOR = '#6b4a34'
const FOLIAGE_COLOR = '#3f7a3f'
const ROAD_COLOR = '#48494e'
const LAMP_POLE_COLOR = '#2e2e33'
const LAMP_HEAD_COLOR = '#ffe9a8'
const CAR_BODY_COLOR = '#c22a2a'
const CAR_CABIN_COLOR = '#12141c'
const CAR_WHEEL_COLOR = '#181818'
const CAR_RIM_COLOR = '#9aa0a6'
const CAR_LIGHT_COLOR = '#fef6d8'
const CAR_SCALE = 1.3
const MARKER_RADIUS = 1.7
const TREE_COUNT = 18
const VILLAGER_COUNT = 6
const VILLAGER_COLORS = ['#d97757', '#4c8bf5', '#2f9e6e', '#a35bd1']

// Simple arcade physics, not a simulation: acceleration/braking on
// forward-back, constant-rate turning on left-right regardless of speed.
// Easier to control at a glance than real steering geometry, which is what
// a portfolio toy needs — nobody should need instructions to drive it.
const ACCEL = 9
const MAX_SPEED = 9
const REVERSE_MAX_SPEED = 5
const FRICTION = 6
const TURN_SPEED = 2.6

function groundHeight(x: number, z: number) {
  return waveHeight(x, z, 0) * AMPLITUDE_SCALE
}

function collidesWithObstacles(x: number, z: number, obstacles: Obstacle[], selfRadius: number): boolean {
  for (const o of obstacles) {
    if (Math.hypot(x - o.x, z - o.z) < selfRadius + o.radius) return true
  }
  return false
}

interface GroundProps {
  bounds: FieldBounds
}

/** Real, lit, rolling land instead of a flat wireframe or an empty sky —
 *  static geometry built once (vertices displaced by the same wave function
 *  used elsewhere, computed up front rather than in a shader), with a
 *  valley-to-hilltop color gradient baked into vertex colors so lighting
 *  has actual terrain to shade. The backdrop above the horizon is a plain
 *  CSS gradient on the container (see GithubExploreMount) tinted the same
 *  green as the far hills, rather than sky blue or washed-out white — this
 *  is meant to read as land stretching to the horizon. */
function Ground({ bounds }: Readonly<GroundProps>) {
  const geometry = useMemo(() => {
    const { width, length, centerX, centerZ } = bounds
    const segX = Math.min(46, Math.max(16, Math.round(width / 1.4)))
    const segZ = Math.min(46, Math.max(16, Math.round(length / 1.4)))
    const geo = new PlaneGeometry(width, length, segX, segZ)
    const pos = geo.attributes.position

    const heights: number[] = []
    for (let i = 0; i < pos.count; i++) {
      const localX = pos.getX(i) + centerX
      const localY = pos.getY(i)
      const worldZ = centerZ - localY
      const h = groundHeight(localX, worldZ)
      heights.push(h)
      pos.setZ(i, h)
    }
    pos.needsUpdate = true
    geo.computeVertexNormals()

    const min = Math.min(...heights)
    const max = Math.max(...heights)
    const range = Math.max(max - min, 0.0001)
    const low = new Color(GROUND_LOW)
    const high = new Color(GROUND_HIGH)
    const colors = new Float32Array(pos.count * 3)
    for (let i = 0; i < pos.count; i++) {
      const t = (heights[i] - min) / range
      const c = low.clone().lerp(high, t)
      colors[i * 3] = c.r
      colors[i * 3 + 1] = c.g
      colors[i * 3 + 2] = c.b
    }
    geo.setAttribute('color', new BufferAttribute(colors, 3))
    geo.translate(centerX, 0, 0)

    return geo
  }, [bounds])

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} geometry={geometry}>
      <meshLambertMaterial vertexColors />
    </mesh>
  )
}

/** Flat ribbons following the terrain's height, one per road segment,
 *  merged into a single draw call. `side={DoubleSide}` sidesteps having to
 *  get the ribbon's winding order exactly right for a shape this thin and
 *  simple — a doubled fragment cost on a handful of narrow strips is
 *  nothing next to the ground plane underneath them. */
function buildRoadRibbon(a: Point, b: Point, width: number): BufferGeometry {
  const dx = b.x - a.x
  const dz = b.z - a.z
  const length = Math.hypot(dx, dz)
  const steps = Math.max(2, Math.round(length / 1.2))
  const dirX = dx / length
  const dirZ = dz / length
  const perpX = -dirZ
  const perpZ = dirX
  const hw = width / 2

  const positions: number[] = []
  const normals: number[] = []
  const indices: number[] = []

  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const cx = a.x + dx * t
    const cz = a.z + dz * t
    const y = groundHeight(cx, cz) + 0.03
    positions.push(cx + perpX * hw, y, cz + perpZ * hw, cx - perpX * hw, y, cz - perpZ * hw)
    normals.push(0, 1, 0, 0, 1, 0)
  }
  for (let i = 0; i < steps; i++) {
    const base = i * 2
    indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3)
  }

  const geo = new BufferGeometry()
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3))
  geo.setAttribute('normal', new Float32BufferAttribute(normals, 3))
  geo.setIndex(indices)
  return geo
}

interface RoadsProps {
  roads: RoadSegment[]
}

function Roads({ roads }: Readonly<RoadsProps>) {
  const geometry = useMemo(() => {
    const color = new Color(ROAD_COLOR)
    return mergeColoredGeometries(roads.map((road) => ({ geometry: buildRoadRibbon(road.a, road.b, road.width), color })))
  }, [roads])

  return (
    <mesh geometry={geometry}>
      <meshLambertMaterial vertexColors side={DoubleSide} />
    </mesh>
  )
}

interface StreetlightsProps {
  positions: Point[]
}

/** Lamp posts along the road network — merged into one mesh regardless of
 *  count, same reasoning as the trees. The heads are a bright, uniform
 *  color rather than a real emissive glow: an emissive value is a
 *  per-material property, and a single shared material is exactly what
 *  keeps every light one draw call. */
function Streetlights({ positions }: Readonly<StreetlightsProps>) {
  const geometry = useMemo(() => {
    const parts: { geometry: BufferGeometry; color: Color }[] = []
    const poleColor = new Color(LAMP_POLE_COLOR)
    const headColor = new Color(LAMP_HEAD_COLOR)

    for (const p of positions) {
      const y = groundHeight(p.x, p.z)
      const pole = new CylinderGeometry(0.035, 0.05, 1.6, 6)
      pole.translate(p.x, y + 0.8, p.z)
      const head = new SphereGeometry(0.12, 8, 8)
      head.translate(p.x, y + 1.66, p.z)
      parts.push({ geometry: pole, color: poleColor }, { geometry: head, color: headColor })
    }

    return mergeColoredGeometries(parts)
  }, [positions])

  return (
    <mesh geometry={geometry}>
      <meshLambertMaterial vertexColors />
    </mesh>
  )
}

/** A house's geometry: a walled box in the project's own color, topped
 *  with a four-sided pyramid roof in a shared terracotta tone — merged
 *  into one indexed geometry (see mergeGeometry) so it's one draw call,
 *  not two, which matters with dozens of these in the field at once. */
function buildHouseGeometry(wallColor: Color): BufferGeometry {
  const body = new BoxGeometry(0.85, 0.6, 0.85)
  body.translate(0, 0.3, 0)

  const roof = new ConeGeometry(0.68, 0.5, 4)
  roof.rotateY(Math.PI / 4)
  roof.translate(0, 0.6 + 0.25, 0)

  return mergeColoredGeometries([
    { geometry: body, color: wallColor },
    { geometry: roof, color: new Color(ROOF_COLOR) },
  ])
}

interface MarkerProps {
  index: number
  position: Point
  project: GithubProject
  carRef: React.RefObject<CarState>
}

/** A project's house in the village — pulses gently while the car is
 *  parked outside it, opens the real repo on GitHub when clicked. */
function Marker({ index, position, project, carRef }: Readonly<MarkerProps>) {
  const mesh = useRef<Mesh>(null)
  const geometry = useMemo(() => buildHouseGeometry(new Color(colorForIndex(index))), [index])

  useFrame((state) => {
    const y = groundHeight(position.x, position.z)
    if (mesh.current) {
      mesh.current.position.set(position.x, y, position.z)
      const active = carRef.current.nearIndex === index
      const t = state.clock.getElapsedTime()
      const targetScale = active ? 1.18 + Math.sin(t * 3) * 0.05 : 1
      const s = lerp(mesh.current.scale.x, targetScale, 0.15)
      mesh.current.scale.set(s, s, s)
    }
  })

  function handleClick() {
    window.open(project.url, '_blank', 'noopener,noreferrer')
  }

  return (
    <mesh ref={mesh} geometry={geometry} onClick={handleClick}>
      <meshLambertMaterial vertexColors />
    </mesh>
  )
}

interface TreesProps {
  trees: Obstacle[]
}

/** Every tree merged into a single geometry (see mergeGeometry), so
 *  however many there are, it costs one draw call total rather than one
 *  per tree. */
function Trees({ trees }: Readonly<TreesProps>) {
  const geometry = useMemo(() => {
    const parts: { geometry: BufferGeometry; color: Color }[] = []
    const trunkColor = new Color(TRUNK_COLOR)
    const foliageColor = new Color(FOLIAGE_COLOR)

    for (const tree of trees) {
      const y = groundHeight(tree.x, tree.z)
      const trunk = new CylinderGeometry(0.06, 0.08, 0.5, 6)
      trunk.translate(tree.x, y + 0.25, tree.z)
      const foliage = new ConeGeometry(0.32, 0.65, 7)
      foliage.translate(tree.x, y + 0.5 + 0.325, tree.z)
      parts.push({ geometry: trunk, color: trunkColor }, { geometry: foliage, color: foliageColor })
    }

    return mergeColoredGeometries(parts)
  }, [trees])

  return (
    <mesh geometry={geometry}>
      <meshLambertMaterial vertexColors />
    </mesh>
  )
}

function buildPersonGeometry(color: Color): BufferGeometry {
  const shade = color.clone().multiplyScalar(0.75)
  const head = new SphereGeometry(0.15, 10, 10)
  head.translate(0, 1.0, 0)
  const body = new CapsuleGeometry(0.14, 0.38, 2, 8)
  body.translate(0, 0.62, 0)
  const legLeft = new BoxGeometry(0.1, 0.4, 0.1)
  legLeft.translate(-0.07, 0.2, 0)
  const legRight = new BoxGeometry(0.1, 0.4, 0.1)
  legRight.translate(0.07, 0.2, 0)

  return mergeColoredGeometries([
    { geometry: head, color },
    { geometry: body, color },
    { geometry: legLeft, color: shade },
    { geometry: legRight, color: shade },
  ])
}

interface VillagerProps {
  color: string
  start: Point
  bounds: FieldBounds
  obstacles: Obstacle[]
}

/** A resident wandering the village on its own — picks a random clear spot,
 *  walks there, picks another. One merged mesh per villager (no separate
 *  animated legs): with everything else already in this scene, the
 *  articulated-walk version the splash toy uses would be six more draw
 *  calls for a detail only visible up close. */
function Villager({ color, start, bounds, obstacles }: Readonly<VillagerProps>) {
  const mesh = useRef<Mesh>(null)
  const state = useRef<VillagerState>(createVillagerState(start.x, start.z))
  const geometry = useMemo(() => buildPersonGeometry(new Color(color)), [color])
  const speed = useRef(0.9 + Math.random() * 0.5)

  useFrame((frame, delta) => {
    const s = state.current
    const dx = s.targetX - s.x
    const dz = s.targetZ - s.z
    const dist = Math.hypot(dx, dz)

    if (dist < 0.15) {
      for (let tries = 0; tries < 8; tries++) {
        const nx = bounds.minX + Math.random() * bounds.width
        const nz = bounds.minZ + Math.random() * bounds.length
        if (!collidesWithObstacles(nx, nz, obstacles, 0.4)) {
          s.targetX = nx
          s.targetZ = nz
          break
        }
      }
    } else {
      const step = Math.min(dist, speed.current * delta)
      s.x += (dx / dist) * step
      s.z += (dz / dist) * step
      s.dirX = dx / dist
      s.dirZ = dz / dist
    }

    const y = groundHeight(s.x, s.z)
    if (mesh.current) {
      const bob = Math.sin(frame.clock.getElapsedTime() * 5 + start.x) * 0.02
      mesh.current.position.set(s.x, y + bob, s.z)
      mesh.current.rotation.y = Math.atan2(s.dirX, s.dirZ)
    }
  })

  return (
    <mesh ref={mesh} geometry={geometry}>
      <meshLambertMaterial vertexColors />
    </mesh>
  )
}

interface CarProps {
  carRef: React.RefObject<CarState>
  keysRef: React.RefObject<KeyState>
  markers: Point[]
  obstacles: Obstacle[]
  onNearChange: (index: number | null) => void
}

/** The toy itself: a low, sleek car — no grille, tinted glass, lit
 *  headlights, rimmed wheels that spin with road speed. Stopped short of
 *  houses and trees rather than driving through them. Driven with the
 *  keyboard rather than followed with the pointer; the camera trails
 *  behind and above, same as every other toy on this site. */
function Car({ carRef, keysRef, markers, obstacles, onNearChange }: Readonly<CarProps>) {
  const group = useRef<Group>(null)
  const wheelRefs = [useRef<Mesh>(null), useRef<Mesh>(null), useRef<Mesh>(null), useRef<Mesh>(null)]
  const camTarget = useRef(new Vector3())

  useFrame((state, delta) => {
    const car = carRef.current
    const keys = keysRef.current

    if (keys.forward) car.speed = Math.min(car.speed + ACCEL * delta, MAX_SPEED)
    else if (keys.backward) car.speed = Math.max(car.speed - ACCEL * delta, -REVERSE_MAX_SPEED)
    else if (car.speed > 0) car.speed = Math.max(0, car.speed - FRICTION * delta)
    else if (car.speed < 0) car.speed = Math.min(0, car.speed + FRICTION * delta)

    if (keys.left) car.heading += TURN_SPEED * delta
    if (keys.right) car.heading -= TURN_SPEED * delta

    const nextX = car.x + Math.sin(car.heading) * car.speed * delta
    const nextZ = car.z + Math.cos(car.heading) * car.speed * delta

    if (collidesWithObstacles(nextX, nextZ, obstacles, CAR_COLLISION_RADIUS)) {
      car.speed = 0
    } else {
      car.x = nextX
      car.z = nextZ
    }

    const y = groundHeight(car.x, car.z)

    if (group.current) {
      group.current.position.set(car.x, y + 0.24, car.z)
      group.current.rotation.y = car.heading
    }

    const wheelSpin = (car.speed * delta) / 0.26
    wheelRefs.forEach((ref) => {
      if (ref.current) ref.current.rotation.x -= wheelSpin
    })

    const behind = 5.5
    const height = 3.4
    camTarget.current.set(
      car.x - Math.sin(car.heading) * behind,
      y + height,
      car.z - Math.cos(car.heading) * behind,
    )
    state.camera.position.lerp(camTarget.current, 0.08)
    state.camera.lookAt(car.x, y + 0.6, car.z)

    let near: number | null = null
    for (let i = 0; i < markers.length; i++) {
      if (Math.hypot(car.x - markers[i].x, car.z - markers[i].z) < MARKER_RADIUS) {
        near = i
        break
      }
    }
    if (car.nearIndex !== near) {
      car.nearIndex = near
      onNearChange(near)
    }
  })

  const wheelPositions: [number, number, number][] = [
    [-0.52, -0.02, 0.6],
    [0.52, -0.02, 0.6],
    [-0.52, -0.02, -0.62],
    [0.52, -0.02, -0.62],
  ]
  const headlightPositions: [number, number, number][] = [
    [-0.32, 0.1, 1.02],
    [0.32, 0.1, 1.02],
  ]

  return (
    <group ref={group} scale={CAR_SCALE}>
      {/* Low, longish body and a short, tinted cabin set well back — a
          fastback-ish silhouette rather than a boxy sedan, and no separate
          grille panel up front, closer to an EV's smooth nose than a
          combustion car's. */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1, 0.26, 2]} />
        <meshLambertMaterial color={CAR_BODY_COLOR} />
      </mesh>
      <mesh position={[0, 0.42, -0.15]}>
        <boxGeometry args={[0.68, 0.24, 0.75]} />
        <meshLambertMaterial color={CAR_CABIN_COLOR} transparent opacity={0.92} />
      </mesh>
      {headlightPositions.map((pos) => (
        <mesh key={pos.join(',')} position={pos}>
          <boxGeometry args={[0.16, 0.08, 0.04]} />
          <meshLambertMaterial color={CAR_LIGHT_COLOR} emissive={CAR_LIGHT_COLOR} emissiveIntensity={0.6} />
        </mesh>
      ))}
      {wheelPositions.map((pos, i) => (
        <group key={pos.join(',')} position={pos} rotation={[0, 0, Math.PI / 2]}>
          <mesh ref={wheelRefs[i]}>
            <cylinderGeometry args={[0.24, 0.24, 0.16, 14]} />
            <meshLambertMaterial color={CAR_WHEEL_COLOR} />
          </mesh>
          <mesh position={[0, 0, 0.085]}>
            <cylinderGeometry args={[0.13, 0.13, 0.02, 12]} />
            <meshLambertMaterial color={CAR_RIM_COLOR} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Keyboard listener, gated by whether the panel is actually hovered or
 *  focused — a global keydown for WASD/arrows would otherwise hijack page
 *  scrolling for every visitor, whether or not they're using the toy. */
function useDriveControls(activeRef: React.RefObject<boolean>, onFirstInput: () => void) {
  const keysRef = useRef(createKeyState())

  useEffect(() => {
    let fired = false
    function setKey(code: string, value: boolean) {
      switch (code) {
        case 'ArrowUp':
        case 'KeyW':
          keysRef.current.forward = value
          return true
        case 'ArrowDown':
        case 'KeyS':
          keysRef.current.backward = value
          return true
        case 'ArrowLeft':
        case 'KeyA':
          keysRef.current.left = value
          return true
        case 'ArrowRight':
        case 'KeyD':
          keysRef.current.right = value
          return true
        default:
          return false
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (!activeRef.current) return
      if (setKey(event.code, true)) {
        event.preventDefault()
        if (!fired) {
          fired = true
          onFirstInput()
        }
      }
    }
    function onKeyUp(event: KeyboardEvent) {
      setKey(event.code, false)
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [activeRef, onFirstInput])

  return keysRef
}

interface GithubExploreSceneProps {
  projects: GithubProject[]
  carRef: React.RefObject<CarState>
  activeRef: React.RefObject<boolean>
  onNearChange: (index: number | null) => void
  onFirstInput: () => void
  onTooSlow: () => void
}

/**
 * The colorful counterpart to the splash toy: a small village built from
 * real GitHub repos — one house per project, in its own color — with
 * roads, street lights, and residents wandering on their own, set in a lit
 * rolling field instead of a wireframe. Driven with the keyboard (arrows
 * or WASD), and stopped by the houses and trees rather than driving
 * through them. Clicking a house opens that repo on GitHub. Lazily loaded
 * and gated by capability checks (see GithubExploreMount).
 */
export default function GithubExploreScene({
  projects,
  carRef,
  activeRef,
  onNearChange,
  onFirstInput,
  onTooSlow,
}: Readonly<GithubExploreSceneProps>) {
  const markers = useMemo(() => buildGridPositions(projects.length), [projects.length])
  const bounds = useMemo(() => computeFieldBounds(markers), [markers])
  const roads = useMemo(() => buildRoadNetwork(projects.length, bounds), [projects.length, bounds])
  const streetlights = useMemo(() => buildStreetlightPositions(roads), [roads])
  const trees = useMemo(() => buildTreePositions(bounds, markers, TREE_COUNT), [bounds, markers])
  const keysRef = useDriveControls(activeRef, onFirstInput)

  const houseObstacles = useMemo<Obstacle[]>(
    () => markers.map((m) => ({ ...m, radius: HOUSE_RADIUS })),
    [markers],
  )
  const obstacles = useMemo(() => [...houseObstacles, ...trees], [houseObstacles, trees])

  const villagerStarts = useMemo(() => {
    return Array.from({ length: VILLAGER_COUNT }, (_, i) => {
      const road = roads[i % roads.length]
      const t = (i + 1) / (VILLAGER_COUNT + 1)
      return { x: road.a.x + (road.b.x - road.a.x) * t, z: road.a.z + (road.b.z - road.a.z) * t }
    })
  }, [roads])

  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      camera={{ position: [0, 3.4, 5.5], fov: 55 }}
    >
      <hemisphereLight args={['#b9cf95', '#4a7c3f', 0.95]} />
      <directionalLight position={[6, 9, 4]} intensity={0.9} color="#fff4d6" />

      <Ground bounds={bounds} />
      <Roads roads={roads} />
      <Streetlights positions={streetlights} />
      <Trees trees={trees} />
      {projects.map((project, i) => (
        <Marker key={project.url} index={i} position={markers[i]} project={project} carRef={carRef} />
      ))}
      {villagerStarts.map((start, i) => (
        <Villager
          key={start.x + ',' + start.z}
          color={VILLAGER_COLORS[i % VILLAGER_COLORS.length]}
          start={start}
          bounds={bounds}
          obstacles={obstacles}
        />
      ))}
      <Car carRef={carRef} keysRef={keysRef} markers={markers} obstacles={obstacles} onNearChange={onNearChange} />

      <FrameRateGuard onTooSlow={onTooSlow} />
    </Canvas>
  )
}
