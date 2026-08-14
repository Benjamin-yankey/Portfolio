/** Cheap feature probe: build a throwaway context and immediately drop it. */
export function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    if (!gl) return false
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

/**
 * Desktop only, and deliberately so. A WebGL scene's cost is a large chunk
 * plus a GPU redraw every frame for as long as it's on screen — spent on a
 * phone that is likely metered and on battery, for effects whose pointer
 * interaction can't even be used without a cursor. Every WebGL scene on this
 * site has a non-WebGL fallback that stands on its own, so skipping it here
 * loses nothing.
 */
export function isCapableDevice() {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return false
  const cores = navigator.hardwareConcurrency
  return cores === undefined || cores >= 4
}
