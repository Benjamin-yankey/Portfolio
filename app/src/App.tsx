import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Splash } from './components/Splash'
import { Hero } from './components/Hero'
import { Projects } from './components/projects/Projects'
import { Skills } from './components/Skills'
import { Experience } from './components/Experience'
import { Journal } from './components/Journal'
import { Contact } from './components/Contact'

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route element={<Layout />}>
          <Route path="home" element={<Hero />} />
          <Route path="projects" element={<Projects />} />
          <Route path="skills" element={<Skills />} />
          <Route path="experience" element={<Experience />} />
          <Route path="journal" element={<Journal />} />
          <Route path="contact" element={<Contact />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
