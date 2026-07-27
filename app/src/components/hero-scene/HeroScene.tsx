import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type { Mesh, ShaderMaterial } from 'three'
import { Color, DoubleSide, Vector2 } from 'three'

// Segment counts set the wireframe's line density. High enough to read as a
// surveyed grid, low enough that the whole mesh stays a few thousand verts —
// this runs behind real content, so it must never be the reason a frame is
// late.
const SEGMENTS_X = 64
const SEGMENTS_Y = 44

// Ink, matching --color-ink. Passed as a uniform rather than set as a
// material color so the fragment shader can fade it by elevation.
const INK = '#1a1a1a'

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uPointer;
  varying float vElevation;
  varying float vDepth;

  void main() {
    vec3 pos = position;

    // Three sine waves at incommensurate frequencies and speeds. Summing
    // them keeps the surface from ever visibly repeating — the difference
    // between a sheet that drifts and one that obviously loops.
    float wave =
        sin(pos.x * 0.55 + uTime * 0.34) * 0.42
      + sin(pos.y * 0.78 - uTime * 0.27) * 0.30
      + sin((pos.x + pos.y) * 0.37 + uTime * 0.19) * 0.36;

    // A soft swell that follows the cursor, falling off with distance so
    // the sheet lifts under the pointer instead of shifting as a whole.
    float d = distance(pos.xy, uPointer * vec2(6.0, 3.6));
    wave += exp(-d * d * 0.06) * 0.7;

    pos.z += wave;
    vElevation = wave;

    vec4 viewPos = modelViewMatrix * vec4(pos, 1.0);
    vDepth = -viewPos.z;
    gl_Position = projectionMatrix * viewPos;
  }
`

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  varying float vElevation;
  varying float vDepth;

  void main() {
    // Crests read darker than troughs, so the wireframe gains shading from
    // its own height rather than needing a light.
    float shade = smoothstep(-1.2, 1.4, vElevation);

    // Distance fade. Without this the grid lines converge toward the horizon
    // faster than they can be resolved and pile into a solid dark band —
    // the far rows have to dissolve before they reach that density. Also
    // eases off the nearest rows, so the sheet has no visible cut edge.
    float far = 1.0 - smoothstep(7.0, 15.0, vDepth);
    float near = smoothstep(1.5, 4.0, vDepth);

    gl_FragColor = vec4(uColor, uOpacity * (0.3 + shade * 0.7) * far * near);
  }
`

function Terrain() {
  const mesh = useRef<Mesh>(null)
  const material = useRef<ShaderMaterial>(null)
  const { viewport } = useThree()

  // Built once and mutated in place each frame. Rebuilding the uniforms
  // object would hand the material a new reference and force a shader
  // recompile on every render.
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPointer: { value: new Vector2(0, 0) },
      uColor: { value: new Color(INK) },
      // Low enough that the mesh stays atmosphere. It sits behind the
      // marquee type, and the moment it competes with that type for
      // attention the hero has two subjects and reads as neither.
      uOpacity: { value: 0.2 },
    }),
    [],
  )

  useFrame((state, delta) => {
    if (!material.current) return
    // Accumulating delta rather than reading the absolute clock keeps the
    // animation from jumping forward after a background tab resumes.
    material.current.uniforms.uTime.value += delta

    // Ease the pointer uniform instead of writing it raw: a fast flick
    // between frames would otherwise teleport the swell across the sheet.
    const pointer = material.current.uniforms.uPointer.value as Vector2
    pointer.x += (state.pointer.x - pointer.x) * 0.05
    pointer.y += (state.pointer.y - pointer.y) * 0.05
  })

  return (
    <mesh ref={mesh} rotation={[-Math.PI / 2.7, 0, 0]} position={[0, -0.4, 0]}>
      <planeGeometry args={[viewport.width * 2.6, 11, SEGMENTS_X, SEGMENTS_Y]} />
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

const WARMUP_SECONDS = 1
const SAMPLE_SECONDS = 2
const MIN_ACCEPTABLE_FPS = 30

interface FrameRateGuardProps {
  onTooSlow: () => void
}

/**
 * Measures the scene's actual frame rate once and, if the machine can't
 * keep up, asks to be removed.
 *
 * The static capability checks in HeroSceneMount can't see this: a browser
 * that reports WebGL support may still be rasterizing in software (a VM, a
 * blocklisted driver), where this wireframe's fill cost drops the whole page
 * to single-digit frames. A portfolio that stutters is worse than one
 * without a background effect, so the effect is what gives way.
 */
function FrameRateGuard({ onTooSlow }: Readonly<FrameRateGuardProps>) {
  const elapsed = useRef(0)
  const frames = useRef(0)
  const settled = useRef(false)

  useFrame((_, delta) => {
    if (settled.current) return
    elapsed.current += delta

    // Skip the first second: shader compilation and the initial upload make
    // the opening frames unrepresentative of the steady state.
    if (elapsed.current < WARMUP_SECONDS) return
    frames.current++
    if (elapsed.current < WARMUP_SECONDS + SAMPLE_SECONDS) return

    settled.current = true
    if (frames.current / SAMPLE_SECONDS < MIN_ACCEPTABLE_FPS) onTooSlow()
  })

  return null
}

interface HeroSceneProps {
  onTooSlow: () => void
}

/**
 * The WebGL half of the hero: a slowly undulating wireframe sheet, drawn in
 * ink on the page's own cream. It is the same visual idea as the CSS layers
 * in front of it — a surveyed grid receding into depth — just rendered with
 * real vertices, so it can ripple rather than only tilt.
 *
 * Loaded lazily and mounted only after the CSS hero is already on screen
 * (see HeroSceneMount), so none of this is on the critical path.
 */
export default function HeroScene({ onTooSlow }: Readonly<HeroSceneProps>) {
  return (
    <Canvas
      // Capped DPR: at 3x on a retina display this shades ~9x the fragments
      // for a wireframe whose lines are already sub-pixel, which is pure
      // heat for no visible gain.
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      camera={{ position: [0, 0.8, 7.5], fov: 42 }}
      // The scene is decorative and sits behind the interactive badge, so it
      // must never intercept a click.
      style={{ pointerEvents: 'none' }}
    >
      <Terrain />
      <FrameRateGuard onTooSlow={onTooSlow} />
    </Canvas>
  )
}
