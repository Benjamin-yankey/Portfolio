export function HeroBadge() {
  return (
    <div
      aria-hidden="true"
      className="relative aspect-[4/5] w-[clamp(260px,42vw,480px)] shrink-0"
    >
      {/* Frosted-glass frame — drop a photo in here later. Left empty for
          now so the moving text marquee shows through the blur, rather
          than a text placeholder, per the "no text in the hero" design. */}
      <div className="absolute inset-0 rounded-[28px] border border-white/60 bg-white/25 shadow-[0_16px_48px_rgba(26,26,26,0.16)] backdrop-blur-md" />
    </div>
  )
}
