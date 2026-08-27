import { site } from '../data/site'
import { projects } from '../data/projects'
import { experience } from '../data/experience'
import { skillCategories, certifications } from '../data/skills'
import { journalEntries } from '../data/journal'
import { githubStats } from '../data/githubStats'

interface Intent {
  keywords: string[]
  answer: () => string
}

/**
 * Keyword-matched, not AI: every answer is built from the same CMS-managed
 * data the rest of the site reads, so there's nothing to keep in sync and
 * nothing that can hallucinate. Order matters on ties — `answerQuestion`
 * keeps the first intent to reach the highest score, so put more specific
 * intents (certifications) ahead of broader ones they could bleed into.
 */
const INTENTS: Intent[] = [
  {
    keywords: ['hi', 'hello', 'hey', 'yo', 'greetings'],
    answer: () =>
      `Hi! I'm a small assistant for ${site.name}'s portfolio. Ask me about skills, projects, experience, certifications, availability, or how to get in touch.`,
  },
  {
    keywords: ['who are you', 'about you', 'yourself', 'bio', 'background', 'tell me about'],
    answer: () => site.bio,
  },
  {
    keywords: ['cert', 'certs', 'certified', 'certification', 'certifications'],
    answer: () =>
      certifications.length === 0
        ? 'No certifications are listed yet.'
        : certifications.map((c) => `${c.name} (${c.issuer}, ${c.year})`).join(' · '),
  },
  {
    keywords: ['skill', 'skills', 'technology', 'technologies', 'stack', 'tools', 'tech'],
    answer: () =>
      skillCategories.length === 0
        ? 'No skills are listed yet.'
        : `${site.name} works across: ${skillCategories.map((c) => `${c.title} (${c.items.join(', ')})`).join('; ')}.`,
  },
  {
    keywords: ['experience', 'work history', 'career', 'roles', 'worked', 'job'],
    answer: () =>
      experience.length === 0
        ? 'No work experience is listed yet.'
        : experience.map((e) => `${e.role} at ${e.company} (${e.period})`).join(' · '),
  },
  {
    keywords: ['project', 'projects', 'built', 'build', 'case study', 'case studies'],
    answer: () =>
      projects.length === 0
        ? 'No projects are listed yet.'
        : projects.map((p) => `${p.title} — ${p.summary}`).join(' · '),
  },
  {
    keywords: ['resume', 'résumé', 'cv', 'download'],
    answer: () =>
      site.resumeHref
        ? `You can download the résumé here: ${site.resumeHref}`
        : "There's no résumé linked yet — try the contact page for other ways to reach out.",
  },
  {
    keywords: ['available', 'availability', 'hiring', 'open to work', 'freelance', 'contract'],
    answer: () => site.availabilityStatus ?? 'Check the Contact page for the latest availability status.',
  },
  {
    keywords: ['github', 'repo', 'repos', 'repositories', 'open source'],
    answer: () => `${site.name} has ${githubStats.repositories} public repositories on GitHub. Take a look: ${site.github}`,
  },
  {
    keywords: ['journal', 'blog', 'article', 'writing', 'post'],
    answer: () =>
      journalEntries.length === 0
        ? 'No journal entries yet — check back later.'
        : journalEntries.map((j) => j.title).join(' · '),
  },
  {
    keywords: ['location', 'based', 'timezone', 'where'],
    answer: () => site.location ?? "Location isn't listed yet — reach out by email to ask.",
  },
  {
    keywords: ['contact', 'reach', 'email', 'hire', 'get in touch', 'talk', 'message'],
    answer: () => `You can reach ${site.name} at ${site.email}, on GitHub (${site.github}), or on LinkedIn (${site.linkedin}).`,
  },
]

const FALLBACK = () =>
  `I don't have an answer for that yet — try asking about skills, projects, experience, certifications, availability, or how to get in touch. You can also email directly at ${site.email}.`

export function answerQuestion(question: string): string {
  const normalized = question.toLowerCase()
  let best: Intent | null = null
  let bestScore = 0

  for (const intent of INTENTS) {
    const score = intent.keywords.filter((keyword) => normalized.includes(keyword)).length
    if (score > bestScore) {
      best = intent
      bestScore = score
    }
  }

  return best ? best.answer() : FALLBACK()
}

export const SUGGESTED_QUESTIONS = [
  'What are your skills?',
  'Show me your projects',
  'How can I contact you?',
  'Are you available for work?',
]
