import experience from '../src/content/experience.json'
import repos from '../src/content/github-projects.json'
import journal from '../src/content/journal.json'
import projects from '../src/content/projects.json'
import site from '../src/content/site.json'
import skills from '../src/content/skills.json'

/**
 * Everything the assistant knows about Benjamin, built from the same CMS
 * content the site renders — so the two can't disagree. Built once per
 * isolate and byte-identical on every request, which is what lets the
 * system prompt hit the prompt cache.
 */
function buildProfile(): string {
  const lines: string[] = []

  lines.push(`# ${site.name}`, `Role: ${site.role}`, `Location: ${site.location}`, `Availability: ${site.availabilityStatus}`)
  lines.push(`Bio: ${site.bio}`, `Open to: ${site.contactSub}`)
  lines.push(`Email: ${site.email}`, `GitHub: ${site.github}`, `LinkedIn: ${site.linkedin}`, `Résumé (PDF): ${site.resumeHref}`)

  lines.push('', '## Experience and education')
  for (const item of experience.items) {
    lines.push(`- ${item.role}, ${item.company} (${item.period})`)
    for (const bullet of item.bullets) lines.push(`  - ${bullet}`)
  }

  lines.push('', '## Projects (each has a page on the site at /Portfolio/projects/<slug>)')
  for (const project of projects.items) {
    lines.push(
      `### ${project.title} (slug: ${project.slug}; ${project.categories.join(', ')})`,
      `Summary: ${project.summary}`,
      `Stack: ${project.stack.join(', ')}`,
      `Problem: ${project.problem}`,
      `Solution: ${project.solution}`,
      `Role: ${project.role}`,
      `Outcome: ${project.keyDetail}`,
      `Links: ${(project.links ?? []).map((link) => `${link.label} ${link.href}`).join(' · ')}`,
    )
  }

  lines.push('', '## Skills')
  for (const category of skills.skillCategories) lines.push(`- ${category.title}: ${category.items.join(', ')}`)
  lines.push('', '## Certifications')
  for (const cert of skills.certifications) {
    lines.push(`- ${cert.name} — ${[cert.issuer, cert.year].filter(Boolean).join(', ')}`)
  }

  lines.push('', '## Writing (journal)')
  for (const entry of journal.items) lines.push(`- ${entry.title} (${entry.date}): ${entry.excerpt}`)

  lines.push('', '## Public GitHub repositories')
  lines.push(repos.items.map((repo) => `${repo.displayName} (${repo.language})`).join('; '))

  return lines.join('\n')
}

export const SYSTEM_PROMPT = `You are the assistant on ${site.name}'s portfolio website. Visitors, often recruiters and engineers, ask about his work, skills and background.

Answer from the profile below. When something isn't covered there, say you don't know and suggest emailing him at ${site.email}; never fill gaps with guesses about employers, dates, numbers or skills. Refer to him in the third person.

Keep replies short: two to five sentences of plain text, no headings or tables. Be specific and name the relevant projects so visitors can find them on the site. If a question has nothing to do with him or his work, say briefly that you can only help with questions about Benjamin.

<profile>
${buildProfile()}
</profile>`
