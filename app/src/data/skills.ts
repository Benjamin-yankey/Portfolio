import content from '../content/skills.json'

export interface SkillCategory {
  title: string
  items: string[]
}

export interface Certification {
  name: string
  issuer: string
  year: string
}

export const skillCategories: SkillCategory[] = content.skillCategories
export const certifications: Certification[] = content.certifications
