import content from '../content/experience.json'

export interface ExperienceItem {
  period: string
  role: string
  company: string
  bullets: string[]
}

export const experience: ExperienceItem[] = content.items
