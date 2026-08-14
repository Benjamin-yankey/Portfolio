/** One vivid color per project marker, cycling if there are more projects
 *  than colors. Deliberately far more saturated than anything else on the
 *  site — this section is meant to read as a distinct, playful departure
 *  from the ink-on-cream editorial language used everywhere else. */
export const MARKER_PALETTE = [
  '#ff6b6b', // coral
  '#ffb84d', // amber
  '#2ec4b6', // teal
  '#9b5de5', // violet
  '#3a86ff', // blue
  '#ff5da2', // pink
  '#8ac926', // lime
  '#fb8b24', // orange
]

export function colorForIndex(index: number): string {
  return MARKER_PALETTE[index % MARKER_PALETTE.length]
}
