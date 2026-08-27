export interface VillagerKind {
  label: string
  color: string
}

/** The residents, each named for an AI tool and coloured to match it, walking
 *  the roads on their own.
 *
 *  Colours are spread across the wheel rather than picked purely for brand
 *  accuracy — several of these tools use near-identical blues, and nine
 *  figures on one green field need to be told apart at a glance.
 *
 *  Lives in its own module rather than in the scene: the mount renders one
 *  DOM name-tag per villager, and it shouldn't have to pull in the whole
 *  lazily-loaded WebGL chunk to know how many to render. Everything that
 *  scales with the population — figures, name tags, road spawn points —
 *  reads its length, so adding a row here is the only edit needed. */
export const VILLAGERS: VillagerKind[] = [
  { label: 'Claude', color: '#d97757' },
  { label: 'ChatGPT', color: '#10a37f' },
  { label: 'Copilot', color: '#8957e5' },
  { label: 'Gemini', color: '#4c8bf5' },
  { label: 'Cursor', color: '#4b5563' },
  { label: 'Perplexity', color: '#20808d' },
  { label: 'DeepSeek', color: '#1a56db' },
  { label: 'Qwen', color: '#b0399b' },
  { label: 'GLM', color: '#b45309' },
]
