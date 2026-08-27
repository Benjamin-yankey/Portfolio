import content from '../content/site.json'

export interface Site {
  name: string
  wordmark: string
  eyebrow: string
  role: string
  tagline: string
  bio: string
  email: string
  github: string
  linkedin: string
  resumeHref: string
  contactSub: string
  footerCopy: string
  portrait: string
  heroVideo?: string
  contactImage?: string
  availabilityStatus?: string
  location?: string
  engagementTypes?: string[]
}

export const site: Site = content
