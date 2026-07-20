export interface ExperienceItem {
  period: string
  role: string
  company: string
  bullets: string[]
}

export const experience: ExperienceItem[] = [
  {
    period: 'Mar 2023 — Present',
    role: 'Site Reliability Engineer',
    company: 'Company B',
    bullets: [
      'Own reliability for a fleet of customer-facing services, setting SLOs and error-budget policy across nine teams.',
      'Lead incident response and postmortems, cutting repeat-incident rate through systemic fixes rather than one-off patches.',
      'Drive capacity planning and cost optimization across multi-region Kubernetes clusters.',
    ],
  },
  {
    period: 'Jun 2021 — Feb 2023',
    role: 'DevOps Engineer',
    company: 'Company A',
    bullets: [
      'Designed and maintained CI/CD pipelines for a 40-engineer product organization.',
      'Introduced infrastructure-as-code practices, replacing manual cloud console changes with reviewed Terraform.',
      'Built the initial observability stack, establishing baseline metrics, dashboards, and alerting.',
    ],
  },
  {
    period: 'Jan 2021 — May 2021',
    role: 'Infrastructure Engineer (Intern)',
    company: 'Company A',
    bullets: [
      'Automated recurring environment-setup tasks with Bash and Python, saving the team several hours weekly.',
      'Contributed to internal documentation for onboarding new engineers onto cloud infrastructure.',
    ],
  },
]
