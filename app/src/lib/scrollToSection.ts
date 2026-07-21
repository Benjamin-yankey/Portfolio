/** Shared smooth-scroll-to-section helper, respecting reduced-motion. */
export function scrollToSection(target: string) {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  document.getElementById(target)?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' })
}
