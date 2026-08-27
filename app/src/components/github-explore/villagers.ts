import content from '../../content/villagers.json'

export interface VillagerKind {
  label: string
  color: string
}

/** The residents, each named for an AI tool and coloured to match it, walking
 *  the roads on their own. Editable via /admin.
 *
 *  Everything that scales with the population — figures, name tags, road
 *  spawn points — reads its length, so adding a row here is the only edit
 *  needed. */
export const VILLAGERS: VillagerKind[] = content.items
