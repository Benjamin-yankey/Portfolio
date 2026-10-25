import content from '../content/skills.json'
import { projects, type Project } from './projects'

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

function words(text: string): string[] {
  return text.toLowerCase().split(/[^a-z0-9.+#]+/).filter(Boolean)
}

/**
 * Whether a project tag names the same tool as one part of a skill entry.
 * Skills and tags are written independently ("ECS / EKS / ECR" vs "ECS
 * Fargate", "Kafka (Redpanda)" vs "Redpanda (Kafka)"), so this compares word
 * sets: a match when either side's words are all contained in the other's.
 * Whole words only — "SQL" must not match "PostgreSQL".
 */
function tagMatchesSkill(tag: string, skill: string): boolean {
  const tagWords = words(tag)
  return skill.split('/').some((part) => {
    const partWords = words(part)
    if (partWords.length === 0) return false
    return (
      partWords.every((word) => tagWords.includes(word)) ||
      tagWords.every((word) => partWords.includes(word))
    )
  })
}

export function projectsUsingSkill(skill: string): Project[] {
  return projects.filter((project) =>
    [...project.tags, ...project.stack].some((tag) => tagMatchesSkill(tag, skill)),
  )
}

/** The Skills-page entry a tool belongs to, if any ("ECS Fargate" → "ECS / EKS / ECR"). */
export function skillForTool(tool: string): string | undefined {
  return skillCategories
    .flatMap((category) => category.items)
    .find((skill) => tagMatchesSkill(tool, skill))
}

/** Every skill with the projects that use it, most-used first. */
export const skillUsage: { skill: string; category: string; projects: Project[] }[] = skillCategories
  .flatMap((category) =>
    category.items.map((skill) => ({
      skill,
      category: category.title,
      projects: projectsUsingSkill(skill),
    })),
  )
  .sort((a, b) => b.projects.length - a.projects.length)
