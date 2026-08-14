import { useMemo, useRef } from 'react'
import { Canvas, useFrame, type ThreeEvent } from '@react-three/fiber'
import type { Group, Mesh, ShaderMaterial } from 'three'
import { Color, DoubleSide, Vector3 } from 'three'
import type { Project } from '../../data/projects'
import { FrameRateGuard } from '../FrameRateGuard'
import { waveHeight, WAVE_HEIGHT_GLSL } from './waveHeight'
import { buildMarkerPositions, isArrived, lerp, setWalkTarget, WALK_SPEED, MARKER_RADIUS, type Point, type RoamState } from './roam'

const INK = '#1a1a1a'
const GROUND_SEGMENTS_X = 18
const GROUND_SEGMENTS_Z = 12

interface GroundProps {
  markers: Point[]
  roamRef: React.RefObject<RoamState>
}

/** The walkable terrain: a calmer, click-driven cousin of the Home hero's
 *  wireframe wave. Clicking or tapping anywhere on it sends the avatar
 *  walking to that point — this is the toy's whole control scheme. */
function Ground({ markers, roamRef }: Readonly<GroundProps>) {
  const material = useRef<ShaderMaterial>(null)

  const { width, length, centerZ } = useMemo(() => {
    const zs = markers.map((m) => m.z)
    const minZ = Math.min(...zs) - 2.5
    const maxZ = Math.max(0, ...zs) + 2.5
    return { width: 9, length: maxZ - minZ, centerZ: (minZ + maxZ) / 2 }
  }, [markers])

  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uOffsetZ: { value: centerZ }, uColor: { value: new Color(INK) } }),
    [centerZ],
  )

  useFrame((state) => {
    if (material.current) material.current.uniforms.uTime.value = state.clock.getElapsedTime()
  })

  const vertexShader = useMemo(
    () => /* glsl */ `
      uniform float uTime;
      uniform float uOffsetZ;
      varying float vElevation;
      varying float vDepth;

      ${WAVE_HEIGHT_GLSL}

      void main() {
        vec3 pos = position;
        float worldX = pos.x;
        float worldZ = uOffsetZ - pos.y;

        float wave = waveHeight(worldX, worldZ, uTime);
        pos.z += wave;
        vElevation = wave;

        vec4 viewPos = modelViewMatrix * vec4(pos, 1.0);
        vDepth = -viewPos.z;
        gl_Position = projectionMatrix * viewPos;
      }
    `,
    [],
  )

  const fragmentShader = /* glsl */ `
    uniform vec3 uColor;
    varying float vElevation;
    varying float vDepth;

    void main() {
      float shade = smoothstep(-0.3, 0.35, vElevation);
      float far = 1.0 - smoothstep(14.0, 24.0, vDepth);
      gl_FragColor = vec4(uColor, (0.16 + shade * 0.22) * far);
    }
  `

  function handlePointerDown(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation()
    setWalkTarget(roamRef.current, { x: event.point.x, z: event.point.z })
  }

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, centerZ]} onPointerDown={handlePointerDown}>
      <planeGeometry args={[width, length, GROUND_SEGMENTS_X, GROUND_SEGMENTS_Z]} />
      <shaderMaterial
        ref={material}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        wireframe
        transparent
        depthWrite={false}
        side={DoubleSide}
      />
    </mesh>
  )
}

interface MarkerProps {
  index: number
  position: Point
  roamRef: React.RefObject<RoamState>
}

/** A project's stop on the ground. Clicking one walks straight to it;
 *  otherwise it just pulses gently once the avatar wanders close enough. */
function Marker({ index, position, roamRef }: Readonly<MarkerProps>) {
  const group = useRef<Group>(null)
  const ring = useRef<Mesh>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    const y = waveHeight(position.x, position.z, t)
    if (group.current) group.current.position.set(position.x, y, position.z)

    const active = roamRef.current.nearIndex === index
    if (ring.current) {
      const targetScale = active ? 1.3 + Math.sin(t * 3) * 0.08 : 1
      ring.current.scale.setScalar(lerp(ring.current.scale.x, targetScale, 0.1))
    }
  })

  function handlePointerDown(event: ThreeEvent<PointerEvent>) {
    event.stopPropagation()
    setWalkTarget(roamRef.current, position)
  }

  return (
    <group ref={group} onPointerDown={handlePointerDown}>
      <mesh position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.3, 0.38, 0.5, 16]} />
        <meshStandardMaterial color={INK} transparent opacity={0.85} />
      </mesh>
      <mesh ref={ring} position={[0, 0.53, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.03, 8, 24]} />
        <meshStandardMaterial color={INK} transparent opacity={0.7} />
      </mesh>
    </group>
  )
}

interface AvatarProps {
  markers: Point[]
  roamRef: React.RefObject<RoamState>
  onNearChange: (index: number | null) => void
}

/** The visitor's stand-in — sphere head, capsule body, two hip-pivoted legs
 *  — walking toward wherever was last clicked. Owns the frame loop for its
 *  own transform, the proximity check against every marker, and the
 *  third-person camera, since all three are defined in terms of the same
 *  live position. */
function Avatar({ markers, roamRef, onNearChange }: Readonly<AvatarProps>) {
  const group = useRef<Group>(null)
  const leftHip = useRef<Group>(null)
  const rightHip = useRef<Group>(null)
  const camTarget = useRef(new Vector3())

  useFrame((state, delta) => {
    const roam = roamRef.current
    const walking = !isArrived(roam)

    if (walking) {
      const dx = roam.targetX - roam.x
      const dz = roam.targetZ - roam.z
      const dist = Math.hypot(dx, dz)
      const step = Math.min(dist, WALK_SPEED * delta)
      roam.x += (dx / dist) * step
      roam.z += (dz / dist) * step
      roam.dirX = lerp(roam.dirX, dx / dist, 0.2)
      roam.dirZ = lerp(roam.dirZ, dz / dist, 0.2)
    }

    const clock = state.clock.getElapsedTime()
    const y = waveHeight(roam.x, roam.z, clock)

    if (group.current) {
      group.current.position.set(roam.x, y + Math.sin(clock * 2) * 0.02, roam.z)
      group.current.rotation.y = Math.atan2(roam.dirX, roam.dirZ)

      const swing = walking ? Math.sin(clock * 8) * 0.55 : 0
      if (leftHip.current) leftHip.current.rotation.x = lerp(leftHip.current.rotation.x, swing, 0.3)
      if (rightHip.current) rightHip.current.rotation.x = lerp(rightHip.current.rotation.x, -swing, 0.3)
    }

    // Third-person, behind and above — offset directly by the walking
    // direction vector rather than reconstructing it from an angle.
    const behind = 6.5
    const height = 4.2
    camTarget.current.set(roam.x - roam.dirX * behind, y + height, roam.z - roam.dirZ * behind)
    state.camera.position.lerp(camTarget.current, 0.06)
    state.camera.lookAt(roam.x, y + 1.1, roam.z)

    let near: number | null = null
    for (let i = 0; i < markers.length; i++) {
      if (Math.hypot(roam.x - markers[i].x, roam.z - markers[i].z) < MARKER_RADIUS) {
        near = i
        break
      }
    }
    if (roam.nearIndex !== near) {
      roam.nearIndex = near
      onNearChange(near)
    }
  })

  return (
    <group ref={group}>
      <mesh position={[0, 1.5, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial color={INK} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <capsuleGeometry args={[0.26, 0.65, 4, 8]} />
        <meshStandardMaterial color={INK} />
      </mesh>
      <group ref={leftHip} position={[-0.13, 0.85, 0]}>
        <mesh position={[0, -0.4, 0]}>
          <boxGeometry args={[0.15, 0.8, 0.15]} />
          <meshStandardMaterial color={INK} />
        </mesh>
      </group>
      <group ref={rightHip} position={[0.13, 0.85, 0]}>
        <mesh position={[0, -0.4, 0]}>
          <boxGeometry args={[0.15, 0.8, 0.15]} />
          <meshStandardMaterial color={INK} />
        </mesh>
      </group>
    </group>
  )
}

interface ExploreSceneProps {
  projects: Project[]
  roamRef: React.RefObject<RoamState>
  onNearChange: (index: number | null) => void
  onTooSlow: () => void
}

/**
 * The Explore toy: a small wireframe ground with one marker per project —
 * click or tap anywhere to walk the figure there, camera follows from
 * behind. There's no autoplay and no script; the only thing that moves the
 * avatar is a pointer event, so it's a toy to poke at rather than a video
 * to watch. Lazily loaded and gated by capability checks (see
 * ExploreSceneMount) since this is inside the splash page's first paint.
 */
export default function ExploreScene({ projects, roamRef, onNearChange, onTooSlow }: Readonly<ExploreSceneProps>) {
  const markers = useMemo(() => buildMarkerPositions(projects.length), [projects.length])

  return (
    <Canvas
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      camera={{ position: [0, 4.2, 6.5], fov: 50 }}
    >
      <ambientLight intensity={1} />
      <directionalLight position={[5, 8, 4]} intensity={0.5} />

      <Ground markers={markers} roamRef={roamRef} />
      {projects.map((project, i) => (
        <Marker key={project.num} index={i} position={markers[i]} roamRef={roamRef} />
      ))}
      <Avatar markers={markers} roamRef={roamRef} onNearChange={onNearChange} />

      <FrameRateGuard onTooSlow={onTooSlow} />
    </Canvas>
  )
}
