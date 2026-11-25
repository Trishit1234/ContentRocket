import { ArrowRight, BarChart3, CalendarDays, Sparkles, Clapperboard, WandSparkles, TrendingUp, Users, Lightbulb, HeartHandshake, CircleHelp, Mail, CheckCircle2 } from 'lucide-react'
import { Link } from 'react-router-dom'
import CreatorVideoBackground from '../components/CreatorVideoBackground'

export default function Landing() {
  const supportEmail = import.meta.env.VITE_SUPPORT_EMAIL
  return (
    <main className="landing">
      <CreatorVideoBackground />
      <nav className="landing-nav">
        <Link className="brand" to="/">Content<span>Rocket</span></Link>
        <div className="nav-links">
          <a href="#features">Features</a><a href="#how">How it works</a><Link to="/generate">AI Generator</Link><a href="#team">Our team</a><a href="#support">Support</a><a href="#contact">Contact</a>
        </div>
        <div className="nav-actions"><Link className="btn ghost" to="/login">Log in</Link><Link className="btn primary" to="/register">Get Started</Link></div>
      </nav>
      <section className="hero">
        <div className="eyebrow"><Sparkles size={14}/> Your complete creator workspace</div>
        <h1>Your next big idea, <span>starts here.</span></h1>
        <p>Plan your posts, shape your ideas with AI, and keep every part of your creator business moving in one place.</p>
        <div className="hero-actions"><Link className="btn primary large" to="/register">Get Started <ArrowRight size={17}/></Link><Link className="btn ghost large" to="/generate">Try AI Generator</Link><a className="btn ghost large" href="#features">Explore Features</a></div>
        <div className="preview">
          <aside><div className="brand mini">Content<span>Rocket</span></div>{['Overview','AI Studio','Calendar','Analytics'].map((x,i)=><div className={i===0?'preview-row active':'preview-row'} key={x}>{x}</div>)}</aside>
          <div className="preview-main"><div className="demo-label">SAMPLE DASHBOARD PREVIEW</div><div className="preview-title">Good morning, Maya</div><div className="preview-grid"><div><small>Content pieces</small><strong>24</strong></div><div><small>Scheduled</small><strong>8</strong></div><div><small>Tasks completed</small><strong>12</strong></div></div><div className="chart-preview"><div className="chart-bars">{[35,55,42,68,62,82,74].map((h,i)=><i style={{height:`${h}%`}} key={i}/>)}</div></div></div>
        </div>
      </section>
      <section className="creator-strip"><span>MADE FOR YOUR CREATOR ERA</span><div><b>Instagram</b><i/><b>YouTube</b><i/><b>TikTok</b><i/><b>and everywhere you create</b></div></section>
      <section id="features" className="features"><div><span className="feature-icon violet"><WandSparkles/></span><h3>Make the blank page disappear</h3><p>Turn a rough topic into fresh ideas, scroll-stopping hooks, scripts and captions.</p></div><div><span className="feature-icon peach"><CalendarDays/></span><h3>Keep every post on track</h3><p>Bring your content plans, deadlines and next steps together in one calm workspace.</p></div><div><span className="feature-icon mint"><TrendingUp/></span><h3>See what’s clicking</h3><p>Keep an eye on your content performance and learn what your audience loves.</p></div></section>
      <section id="how" className="how-section"><div className="how-copy"><div className="eyebrow"><Clapperboard size={14}/> YOUR CREATOR HQ</div><h2>More creating.<br/><span>Less juggling.</span></h2><p>From the first spark of an idea to the moment you hit publish, ContentRocket keeps your creative workflow in motion.</p><Link className="btn primary large" to="/register">Build your workflow <ArrowRight size={17}/></Link></div><div className="how-steps"><article><span>01</span><div><h3>Catch the idea</h3><p>Capture concepts before they disappear.</p></div></article><article><span>02</span><div><h3>Make it yours</h3><p>Shape content for your voice and platform.</p></div></article><article><span>03</span><div><h3>Show up consistently</h3><p>Plan ahead and make room to create.</p></div></article></div></section>
      <section id="team" className="team-section">
        <div className="section-intro"><div className="eyebrow"><Users size={14}/> OUR TEAM</div><h2>Creator work is a team sport.</h2><p>ContentRocket brings the parts of your workflow together, so your ideas, plans and growth can move as one.</p></div>
        <div className="team-grid">
          <article><span className="team-icon violet"><Lightbulb/></span><small>IDEAS & DIRECTION</small><h3>Start with your voice</h3><p>Set your niche, audience and tone, then use them to guide the work you create.</p></article>
          <article><span className="team-icon peach"><Clapperboard/></span><small>CREATION & PLANNING</small><h3>Make the next step clear</h3><p>Shape ideas into drafts, organize your calendar and keep upcoming work visible.</p></article>
          <article><span className="team-icon mint"><HeartHandshake/></span><small>BUSINESS & GROWTH</small><h3>Build momentum over time</h3><p>Keep track of partnerships, tasks and the content signals you choose to record.</p></article>
        </div>
      </section>
      <section id="support" className="support-section">
        <div className="support-heading"><div className="eyebrow"><CircleHelp size={14}/> HELP & SUPPORT</div><h2>Questions? We’ve got you.</h2><p>Quick answers for the things creators ask most.</p></div>
        <div className="faq-list">
          <details><summary>What can I make with ContentRocket?<span>+</span></summary><p>Generate content ideas, video scripts and captions, then save drafts to your Content Library.</p></details>
          <details><summary>Can I plan content for different platforms?<span>+</span></summary><p>Yes. Add posts for Instagram, YouTube, TikTok and other platforms to your calendar.</p></details>
          <details><summary>Does ContentRocket publish posts for me?<span>+</span></summary><p>Not currently. The calendar helps you plan and track posts; publishing still happens on each platform.</p></details>
          <details><summary>How do I keep my account details current?<span>+</span></summary><p>After signing in, open My Profile to update your niche, audience, preferred tone and creator goals.</p></details>
        </div>
      </section>
      <section id="contact" className="contact-section">
        <div className="contact-card"><div className="contact-copy"><div className="eyebrow"><Mail size={14}/> CONTACT US</div><h2>We’d love to hear what you’re making.</h2><p>Questions, ideas or feedback? Get in touch and help us make ContentRocket better for creators.</p>{supportEmail ? <a className="btn primary large" href={`mailto:${supportEmail}?subject=ContentRocket%20support`}>Email our team <ArrowRight size={17}/></a> : <a className="btn primary large" href="#support">Visit the help center <ArrowRight size={17}/></a>}</div><div className="contact-points"><div><CheckCircle2/><span>Product questions</span></div><div><CheckCircle2/><span>Feedback and ideas</span></div><div><CheckCircle2/><span>Partnership enquiries</span></div></div></div>
      </section>
      <footer className="landing-footer"><Link className="brand" to="/">Content<span>Rocket</span></Link><p>More room to create. More clarity to grow.</p><div className="footer-links"><a href="#features">Features</a><a href="#team">Our team</a><a href="#support">Support</a><a href="#contact">Contact</a><Link to="/login">Log in</Link></div><small>© {new Date().getFullYear()} ContentRocket. Built for creators.</small></footer>
    </main>
  )
}
