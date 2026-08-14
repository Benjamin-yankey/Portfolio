// Calmer cousin of the Home hero's terrain wave — same idea (three
// incommensurate sine waves so the surface never visibly repeats), much
// lower amplitude, because this ground has to read as walkable, not as
// ocean swell. Written once here and consumed two places that must never
// drift apart: the ground's vertex shader (GLSL, ExploreScene.tsx) and the
// avatar's height (JS, so it appears to walk over the same hills it's
// standing on rather than floating at a fixed y).
const FREQ_X = 0.5
const SPEED_X = 0.3
const AMP_X = 0.12

const FREQ_Z = 0.7
const SPEED_Z = 0.24
const AMP_Z = 0.09

const FREQ_XZ = 0.33
const SPEED_XZ = 0.17
const AMP_XZ = 0.1

export function waveHeight(worldX: number, worldZ: number, time: number): number {
  return (
    Math.sin(worldX * FREQ_X + time * SPEED_X) * AMP_X +
    Math.sin(worldZ * FREQ_Z - time * SPEED_Z) * AMP_Z +
    Math.sin((worldX + worldZ) * FREQ_XZ + time * SPEED_XZ) * AMP_XZ
  )
}

/** Inlined into the ground shader — must stay numerically identical to the
 *  function above (same constants, same operation order). */
export const WAVE_HEIGHT_GLSL = /* glsl */ `
  float waveHeight(float worldX, float worldZ, float time) {
    float wave = sin(worldX * ${FREQ_X} + time * ${SPEED_X}) * ${AMP_X};
    wave += sin(worldZ * ${FREQ_Z} - time * ${SPEED_Z}) * ${AMP_Z};
    wave += sin((worldX + worldZ) * ${FREQ_XZ} + time * ${SPEED_XZ}) * ${AMP_XZ};
    return wave;
  }
`
