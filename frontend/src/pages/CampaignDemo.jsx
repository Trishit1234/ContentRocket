import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, CalendarDays, Check, Clipboard, Download, Play, RotateCcw, Sparkles, Target, TrendingUp } from 'lucide-react'
import { Link } from 'react-router-dom'

const STORAGE_KEY = 'contentrocket-classroom-demo-v1'
const ideas = [
  ['Teach one useful thing', 'Break {topic} into three steps a beginner can try today.', 'How-to'],
  ['Share the real story', 'Show the moment {topic} got difficult, and the small change that helped.', 'Behind the scenes'],
  ['Answer a common question', 'Answer: “What is the first thing I should know about {topic}?”', 'FAQ'],
  ['Challenge a popular belief', 'Explain one popular {topic} tip you disagree with, and why.', 'Point of view'],
  ['Make a quick checklist', 'Give your audience a short checklist for getting started with {topic}.', 'Carousel'],
  ['Show the before and after', 'Compare the old way and the improved way to approach {topic}.', 'Mini case study'],
  ['Invite the audience in', 'Ask your audience to share their biggest question about {topic}.', 'Community prompt'],
]

const starterCampaign = { topic: 'building a creator brand', platform: 'Instagram', weeklyGoal: 5, audience: 'new creators' }

function createPlan(campaign) {
  const count = Math.min(7, Math.max(3, Number(campaign.weeklyGoal) || 5))
  const today = new Date()
  return ideas.slice(0, count).map(([title, description, format], index) => {
    const day = new Date(today)
    day.setDate(today.getDate() + index)
    return {
      id: `${Date.now()}-${index}`,
      title,
      description: description.replaceAll('{topic}', campaign.topic.trim() || 'your topic'),
      format: formatForPlatform(format, campaign.platform),
      day: day.toISOString().slice(0, 10),
      status: 'Idea',
    }
  })
}

function formatForPlatform(format, platform) {
  if (platform === 'YouTube') return format === 'Carousel' ? 'Short video' : 'YouTube video'
  if (platform === 'TikTok') return 'TikTok video'
  if (platform === 'LinkedIn') return format === 'Carousel' ? 'Document post' : 'Text post'
  return format === 'How-to' || format === 'Behind the scenes' ? 'Reel' : format
}

function loadDemo() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved?.campaign && Array.isArray(saved.posts) && saved.posts.length) return saved
  } catch { /* Start with the sample plan if browser storage is unavailable. */ }
  return { campaign: starterCampaign, posts: createPlan(starterCampaign) }
}

function prettyDay(value) {
  return new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(`${value}T12:00:00`))
}

export default function CampaignDemo() {
  const [saved, setSaved] = useState(loadDemo)
  const [copied, setCopied] = useState(false)
  const [message, setMessage] = useState('')
  const [campaign, setCampaign] = useState(saved.campaign)
  const published = saved.posts.filter((post) => post.status === 'Published').length
  const inProduction = saved.posts.filter((post) => post.status === 'In production').length
  const progress = saved.posts.length ? Math.round((published / saved.posts.length) * 100) : 0
  const summary = useMemo(() => saved.posts.map((post, index) => `${index + 1}. ${prettyDay(post.day)} · ${post.title}\n${post.description}\n${post.format} · ${post.status}`).join('\n\n'), [saved.posts])

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(saved)) } catch { setMessage('Browser storage is unavailable. Your current plan will last until this page closes.') }
  }, [saved])

  const makePlan = (event) => {
    event.preventDefault()
    setSaved({ campaign, posts: createPlan(campaign) })
    setMessage('Your weekly campaign plan is ready.')
  }

  const updateStatus = (id, status) => {
    setSaved((current) => ({ ...current, posts: current.posts.map((post) => post.id === id ? { ...post, status } : post) }))
    setMessage('Progress saved on this device.')
  }

  const updateDescription = (id, description) => {
    setSaved((current) => ({ ...current, posts: current.posts.map((post) => post.id === id ? { ...post, description } : post) }))
  }

  const copyPlan = async () => {
    try {
      await navigator.clipboard.writeText(`ContentRocket · ${saved.campaign.platform} weekly plan\n\n${summary}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch { setMessage('Clipboard access is blocked by this browser. Use Download plan instead.') }
  }

  const downloadPlan = () => {
    const blob = new Blob([JSON.stringify(saved, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = 'contentrocket-weekly-campaign.json'
    link.click()
    URL.revokeObjectURL(link.href)
    setMessage('Campaign downloaded as a JSON file.')
  }

  const resetPlan = () => {
    setCampaign(starterCampaign)
    setSaved({ campaign: starterCampaign, posts: createPlan(starterCampaign) })
    setMessage('Sample campaign restored.')
  }

  return (
    <main className="campaign-demo">
      <header className="campaign-topbar">
        <Link className="brand" to="/">Content<span>Rocket</span></Link>
        <div className="campaign-top-actions"><span className="demo-status"><i /> LIVE INTERACTIVE DEMO</span><Link className="btn ghost" to="/generate"><Sparkles size={15} /> AI Studio</Link></div>
      </header>
      <section className="campaign-intro">
        <Link className="campaign-back" to="/"><ArrowLeft size={15} /> Back to home</Link>
        <div className="campaign-intro-copy"><span className="campaign-kicker"><Play size={13} fill="currentColor" /> CREATOR CAMPAIGN LAB</span><h1>Turn one idea into<br /><span>a week of content.</span></h1><p>Build a campaign, shape each post, and track its progress. This demo works right in your browser—no account or AI service required.</p></div>
        <div className="campaign-orbit orbit-one" /><div className="campaign-orbit orbit-two" />
      </section>
      <div className="campaign-body">
        <section className="campaign-metrics" aria-label="Campaign progress">
          <article><span className="campaign-metric-icon purple"><CalendarDays size={17} /></span><div><small>Planned this week</small><strong>{saved.posts.length} <em>posts</em></strong></div></article>
          <article><span className="campaign-metric-icon orange"><Play size={17} /></span><div><small>In production</small><strong>{inProduction} <em>posts</em></strong></div></article>
          <article><span className="campaign-metric-icon green"><Check size={18} /></span><div><small>Published</small><strong>{published} <em>posts</em></strong></div></article>
          <article className="campaign-progress-card"><span className="campaign-metric-icon blue"><TrendingUp size={17} /></span><div><small>Weekly progress</small><strong>{progress}<em>%</em></strong></div><div className="campaign-progress-track"><i style={{ width: `${progress}%` }} /></div></article>
        </section>
        <section className="campaign-layout">
          <form className="campaign-builder" onSubmit={makePlan}>
            <div className="campaign-section-head"><div><span className="campaign-step">01</span><h2>Campaign brief</h2></div><Target size={18} /></div>
            <p className="campaign-muted">Set the direction. Your weekly plan updates instantly.</p>
            <label>What are you creating about?<input value={campaign.topic} onChange={(event) => setCampaign({ ...campaign, topic: event.target.value })} placeholder="e.g. budget-friendly recipes" required /></label>
            <label>Who do you want to reach?<input value={campaign.audience} onChange={(event) => setCampaign({ ...campaign, audience: event.target.value })} placeholder="e.g. first-time founders" /></label>
            <div className="campaign-form-row"><label>Platform<select value={campaign.platform} onChange={(event) => setCampaign({ ...campaign, platform: event.target.value })}>{['Instagram', 'YouTube', 'TikTok', 'LinkedIn'].map((item) => <option key={item}>{item}</option>)}</select></label><label>Weekly goal<select value={campaign.weeklyGoal} onChange={(event) => setCampaign({ ...campaign, weeklyGoal: Number(event.target.value) })}>{[3, 4, 5, 6, 7].map((item) => <option key={item} value={item}>{item} posts</option>)}</select></label></div>
            <button className="btn primary campaign-create" type="submit"><Sparkles size={16} /> Build my weekly plan</button>
            {message && <p className="campaign-feedback" role="status">{message}</p>}
            <div className="campaign-demo-note"><Sparkles size={15} /><p><strong>Presentation mode</strong><br />Template-based demo planner. Your edits stay in this browser and are not sent to a server.</p></div>
          </form>
          <section className="campaign-plan">
            <div className="campaign-plan-head"><div><span className="campaign-step">02</span><div><h2>Your content week</h2><p>{saved.campaign.platform} · for {saved.campaign.audience || 'your audience'}</p></div></div><div className="campaign-plan-actions"><button className="btn ghost" onClick={copyPlan}><Clipboard size={15} />{copied ? 'Copied!' : 'Copy'}</button><button className="btn ghost" onClick={downloadPlan}><Download size={15} />Export</button><button className="campaign-reset" onClick={resetPlan} aria-label="Reset sample plan" title="Reset sample plan"><RotateCcw size={16} /></button></div></div>
            <div className="campaign-post-list">{saved.posts.map((post, index) => <article className="campaign-post" key={post.id}><div className="campaign-post-date"><span>{prettyDay(post.day).split(',')[0]}</span><strong>{prettyDay(post.day).split(' ').at(-1)}</strong></div><div className="campaign-post-content"><div className="campaign-post-title"><span className="campaign-post-number">0{index + 1}</span><h3>{post.title}</h3><span className="campaign-format">{post.format}</span></div><textarea aria-label={`Edit post ${index + 1}`} value={post.description} onChange={(event) => updateDescription(post.id, event.target.value)} rows="2" /><div className="campaign-post-footer"><span>For {saved.campaign.audience || 'your audience'}</span><select aria-label={`Status for ${post.title}`} className={`campaign-post-status status-${post.status.toLowerCase().replace(' ', '-')}`} value={post.status} onChange={(event) => updateStatus(post.id, event.target.value)}>{['Idea', 'In production', 'Published'].map((status) => <option key={status}>{status}</option>)}</select></div></div></article>)}</div>
            <footer className="campaign-plan-footer"><span><i /> Saved automatically on this device</span><span>{saved.posts.length} campaign pieces</span></footer>
          </section>
        </section>
        <footer className="campaign-footer"><span>CONTENTROCKET</span><p>Plan with purpose. Create with momentum.</p><Link to="/register">Create a free account <ArrowLeft size={14} /></Link></footer>
      </div>
    </main>
  )
}
