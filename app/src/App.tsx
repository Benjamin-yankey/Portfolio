import { type ComponentType, lazy } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Splash } from './components/Splash'

/** A page loaded on first visit to its route, so the entry bundle stays small. */
function page<Name extends string>(load: () => Promise<Record<Name, ComponentType>>, name: Name) {
  return lazy(() => load().then((module) => ({ default: module[name] })))
}

const Hero = page(() => import('./components/Hero'), 'Hero')
const Projects = page(() => import('./components/projects/Projects'), 'Projects')
const ProjectPage = page(() => import('./components/projects/ProjectPage'), 'ProjectPage')
const Skills = page(() => import('./components/Skills'), 'Skills')
const Experience = page(() => import('./components/Experience'), 'Experience')
const Journal = page(() => import('./components/Journal'), 'Journal')
const JournalArticle = page(() => import('./components/journal/JournalArticle'), 'JournalArticle')
const Gallery = page(() => import('./components/Gallery'), 'Gallery')
const Contact = page(() => import('./components/Contact'), 'Contact')
const Resume = page(() => import('./components/Resume'), 'Resume')
const NotFound = page(() => import('./components/NotFound'), 'NotFound')

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route element={<Layout />}>
          <Route path="home" element={<Hero />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:slug" element={<ProjectPage />} />
          <Route path="skills" element={<Skills />} />
          <Route path="experience" element={<Experience />} />
          <Route path="journal" element={<Journal />} />
          <Route path="journal/:slug" element={<JournalArticle />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="contact" element={<Contact />} />
          <Route path="resume" element={<Resume />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
