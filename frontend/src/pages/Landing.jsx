import { ArrowRight, BarChart3, CalendarDays, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <main className="landing">
      <nav className="landing-nav">
        <Link className="brand" to="/">Content<span>Rocket</span></Link>
        <div className="nav-links">
          <a href="#features">Features</a><a href="#how">How it works</a><Link to="/generate">AI Generator</Link>
        </div>
        <div className="nav-actions"><Link className="btn ghost" to="/login">Log in</Link><Link className="btn primary" to="/register">Get Started</Link></div>
      </nav>
      <section className="hero">
        <div className="eyebrow"><Sparkles size={14}/> Your complete creator workspace</div>
        <h1>Create Smarter. <span>Grow Faster.</span></h1>
        <p>Your complete AI-powered workspace to plan, create, organize and grow your content business.</p>
        <div className="hero-actions"><Link className="btn primary large" to="/register">Get Started <ArrowRight size={17}/></Link><Link className="btn ghost large" to="/generate">Try AI Generator</Link><a className="btn ghost large" href="#features">Explore Features</a></div>
        <div className="preview">
          <aside><div className="brand mini">Content<span>Rocket</span></div>{['Overview','AI Studio','Calendar','Analytics'].map((x,i)=><div className={i===0?'preview-row active':'preview-row'} key={x}>{x}</div>)}</aside>
          <div className="preview-main"><div className="demo-label">SAMPLE DASHBOARD PREVIEW</div><div className="preview-title">Good morning, Maya</div><div className="preview-grid"><div><small>Content pieces</small><strong>24</strong></div><div><small>Scheduled</small><strong>8</strong></div><div><small>Tasks completed</small><strong>12</strong></div></div><div className="chart-preview"><div className="chart-bars">{[35,55,42,68,62,82,74].map((h,i)=><i style={{height:`${h}%`}} key={i}/>)}</div></div></div>
        </div>
      </section>
      <section id="features" className="features"><div><Sparkles/><h3>AI-powered creation</h3><p>Turn topics into polished ideas, scripts and captions.</p></div><div><CalendarDays/><h3>Plan with clarity</h3><p>Organize every post across platforms in one calendar.</p></div><div><BarChart3/><h3>Understand growth</h3><p>Track your own manually entered performance data.</p></div></section>
    </main>
  )
}
