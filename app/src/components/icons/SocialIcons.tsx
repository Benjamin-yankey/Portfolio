interface IconProps {
  size?: number
  className?: string
}

export function GitHubIcon({ size = 18, className }: Readonly<IconProps>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        d="M12 .5a12 12 0 0 0-3.79 23.4c.6.11.82-.26.82-.58v-2.17c-3.34.73-4.04-1.6-4.04-1.6-.55-1.4-1.34-1.77-1.34-1.77-1.1-.75.08-.74.08-.74 1.21.09 1.85 1.24 1.85 1.24 1.08 1.84 2.83 1.31 3.52 1 .11-.78.42-1.31.77-1.61-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.12-.3-.54-1.53.12-3.19 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.02 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.24 2.89.12 3.19.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.63-5.49 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58A12 12 0 0 0 12 .5Z"
      />
    </svg>
  )
}

export function LinkedInIcon({ size = 18, className }: Readonly<IconProps>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        d="M6.94 8.5H3.56V21h3.38V8.5ZM5.25 3a1.96 1.96 0 1 0 0 3.92 1.96 1.96 0 0 0 0-3.92ZM20.44 21h-3.37v-6.4c0-1.53-.03-3.49-2.13-3.49-2.14 0-2.47 1.67-2.47 3.38V21H9.1V8.5h3.24v1.7h.05c.45-.85 1.56-1.75 3.2-1.75 3.42 0 4.05 2.25 4.05 5.18V21Z"
      />
    </svg>
  )
}

export function EmailIcon({ size = 18, className }: Readonly<IconProps>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path
        fill="currentColor"
        d="M2 5.5A1.5 1.5 0 0 1 3.5 4h17A1.5 1.5 0 0 1 22 5.5v13a1.5 1.5 0 0 1-1.5 1.5h-17A1.5 1.5 0 0 1 2 18.5v-13Zm2.2.6 7.4 5.9a.8.8 0 0 0 .8 0l7.4-5.9H4.2Zm15.8 1.9-7.06 5.63a2.8 2.8 0 0 1-3.48 0L4.4 8v10.6h15.6V8Z"
      />
    </svg>
  )
}
