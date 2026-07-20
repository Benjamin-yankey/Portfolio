export interface SkillCategory {
  title: string
  items: string[]
}

export const skillCategories: SkillCategory[] = [
  { title: 'Cloud', items: ['AWS', 'Azure', 'GCP'] },
  { title: 'Containers & Orchestration', items: ['Docker', 'Kubernetes', 'Helm'] },
  { title: 'IaC & Config Management', items: ['Terraform', 'Ansible', 'Pulumi'] },
  { title: 'CI/CD', items: ['Jenkins', 'GitHub Actions', 'GitLab CI', 'ArgoCD'] },
  { title: 'Observability', items: ['Prometheus', 'Grafana', 'Loki / ELK', 'Datadog'] },
  { title: 'Scripting & Languages', items: ['Bash', 'Python', 'Go'] },
]

export interface Certification {
  name: string
  issuer: string
  year: string
}

export const certifications: Certification[] = [
  {
    name: 'AWS Certified DevOps Engineer – Professional',
    issuer: 'Amazon Web Services',
    year: '2024',
  },
  {
    name: 'Certified Kubernetes Administrator (CKA)',
    issuer: 'Cloud Native Computing Foundation',
    year: '2023',
  },
  {
    name: 'HashiCorp Certified: Terraform Associate',
    issuer: 'HashiCorp',
    year: '2023',
  },
]
