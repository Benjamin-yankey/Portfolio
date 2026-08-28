import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { site } from '../../data/site'
import './HeroLanding.css'

const EASE = [0.16, 1, 0.3, 1] as const

// Falls back to the original reference clip if the CMS field is ever cleared.
const FALLBACK_VIDEO_SRC =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260508_215831_c6a8989c-d716-4d8d-8745-e972a2eec711.mp4'

export function HeroLanding() {
  return (
    <section className="hl-section">
      <motion.div
        className="hl-video-wrap"
        initial={{ opacity: 0, scale: 1.05 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.8, ease: EASE }}
      >
        <div className="hl-video-inner">
          <video
            className="hl-video"
            src={site.closingVideo || FALLBACK_VIDEO_SRC}
            autoPlay
            muted
            loop
            playsInline
          />
        </div>
      </motion.div>

      <motion.div
        className="hl-footer"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, delay: 0.5, ease: EASE }}
      >
        <div className="hl-footer-left">
          <motion.div
            className="hl-badge"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.6, ease: EASE }}
          >
            <span className="hl-badge-dot" aria-hidden="true" />
            <span>{site.availabilityStatus ?? 'Open to new opportunities'}</span>
          </motion.div>

          <motion.h1
            className="hl-heading"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.8, ease: EASE }}
          >
            {site.tagline}
          </motion.h1>

          <motion.div
            className="hl-buttons"
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.8, delay: 1.0, ease: EASE }}
          >
            <Link to="/projects" className="hl-btn-primary">
              View my work <span aria-hidden="true">→</span>
            </Link>
            <Link to="/contact" className="hl-btn-secondary">
              Get in touch
            </Link>
          </motion.div>
        </div>

        <div className="hl-footer-right">
          <span className="tag-pill hl-tag-pill">Terraform</span>
          <span className="tag-pill hl-tag-pill">Kubernetes</span>
          <span className="tag-pill hl-tag-pill">CI/CD</span>
        </div>
      </motion.div>
    </section>
  )
}
