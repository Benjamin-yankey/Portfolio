import content from '../content/projects.json'

export interface ProjectLink {
  label: string
  href: string
}

export interface Project {
  num: string
  title: string
  summary: string
  tags: string[]
  problem: string
  solution: string
  role: string
  keyDetail: string
  image?: string
  video?: string
  /** Code, live site, docs — shown as buttons under the key detail. */
  links?: ProjectLink[]
}

export const projects: Project[] = content.items
