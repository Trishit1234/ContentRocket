export default function CreatorVideoBackground() {
  return (
    <video className="creator-video-bg" autoPlay muted loop playsInline poster="/images/creator-studio-bg.png" aria-hidden="true" tabIndex={-1}>
      <source src="/videos/creator-background.mp4" type="video/mp4" />
    </video>
  )
}
