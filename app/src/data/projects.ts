import content from '../content/projects.json'

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
}

export const projects: Project[] = content.items
