import { useState } from 'react'
import { projects } from '../../data/projects'
import { Reveal } from '../Reveal'
import { SectionHeading } from '../SectionHeading'
import { ProjectItem } from './ProjectItem'

/** Selected-work section: accordion where at most one project is open at a time. */
export function Projects() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="projects" className="section border-b border-line-soft">
      <div className="container-page">
        <SectionHeading title="Selected work" index="01 — Projects" />

        <Reveal as="ul" className="border-t border-line">
          {projects.map((project, index) => (
            <ProjectItem
              key={project.num}
              project={project}
              isOpen={openIndex === index}
              onToggle={() => setOpenIndex((current) => (current === index ? null : index))}
            />
          ))}
        </Reveal>
      </div>
    </section>
  )
}
