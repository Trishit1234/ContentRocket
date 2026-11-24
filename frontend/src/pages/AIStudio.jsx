import { useEffect, useState } from 'react'
import { Copy, Sparkles, Save } from 'lucide-react'
import { api } from '../services/api'

const initialForm = {
  niche: '',
  platform: 'Instagram',
  topic: '',
  target_audience: '',
  content_format: '',
  tone: 'Professional',
  number: 5,
  duration: '60 seconds',
  style: 'Educational',
  language: 'English',
  length: 'Medium',
  keywords: '',
  additional_instructions: '',
}

export default function AIStudio({ kind = 'idea' }) {
  const [form, setForm] = useState(initialForm)
  const [data, setData] = useState(null)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/creators/profile/').then((response) => {
      const profile = response.data.results?.[0] || response.data[0]
      if (!profile) return
      setForm((current) => ({
        ...current,
        niche: current.niche || profile.niche || '',
        target_audience: current.target_audience || profile.target_audience || '',
        tone: profile.preferred_tone || current.tone,
      }))
    }).catch(() => {})
  }, [])

  const update = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    setError('')
    setNotice('')
  }

  const generate = async () => {
    if (!form.topic.trim()) {
      setError('Add a topic before generating.')
      return
    }
    setLoading(true)
    setError('')
    setNotice('')
    setData(null)
    try {
      const endpoint = kind === 'script' ? '/scripts/generate/' : kind === 'caption' ? '/captions/generate/' : '/ideas/generate/'
      const response = await api.post(endpoint, form)
      setData(response.data)
    } catch (e) {
      setError(e.response?.data?.detail || e.response?.data?.topic?.[0] || 'Could not generate content. Check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  const save = async () => {
    if (!data) return
    setSaving(true)
    setError('')
    setNotice('')
    try {
      if (kind === 'idea') {
        await Promise.all((data.ideas || []).map((idea) => api.post('/ideas/', {
          title: idea.title,
          idea: idea.idea,
          hook: idea.hook,
          description: idea.description,
          format: idea.format,
          platform: form.platform,
          target_audience: idea.target_audience || form.target_audience,
          call_to_action: idea.call_to_action,
        })))
      } else if (kind === 'script') {
        await api.post('/scripts/', { title: data.title, content: data, platform: form.platform, topic: form.topic })
      } else {
        await api.post('/captions/', { topic: form.topic, captions: data.captions, hashtags: data.hashtags, calls_to_action: data.calls_to_action, hooks: data.hooks })
      }
      setNotice('Saved to your content library.')
    } catch (e) {
      setError(e.response?.data?.detail || 'Could not save this content.')
    } finally {
      setSaving(false)
    }
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2))
      setNotice('Copied to clipboard.')
    } catch {
      setError('Clipboard access is unavailable in this browser.')
    }
  }

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="date-label">AI WORKSPACE</p>
          <h1>{kind === 'script' ? 'AI Script Writer' : kind === 'caption' ? 'Caption & Hashtag Generator' : 'AI Content Studio'}</h1>
        </div>
        <button className="btn primary" onClick={save} disabled={!data || saving}>
          <Save size={16} />{saving ? 'Saving...' : 'Save'}
        </button>
      </div>
      <div className="studio-grid">
        <section className="card studio-controls">
          <div className="card-header"><h2>Generation details</h2></div>
          <div className="tool-form">
            {kind === 'idea' && (
              <>
                <label>Niche<input value={form.niche} onChange={(e) => update('niche', e.target.value)} placeholder="e.g. Technology" /></label>
                <label>Platform<select value={form.platform} onChange={(e) => update('platform', e.target.value)}>{['Instagram', 'YouTube', 'TikTok', 'Facebook', 'LinkedIn', 'X', 'Pinterest', 'Blogs', 'Podcasts'].map((x) => <option key={x}>{x}</option>)}</select></label>
                <label>Topic<input required value={form.topic} onChange={(e) => update('topic', e.target.value)} placeholder="What should the content be about?" /></label>
                <label>Target audience<input value={form.target_audience} onChange={(e) => update('target_audience', e.target.value)} placeholder="Describe your audience" /></label>
                <label>Content format<input value={form.content_format} onChange={(e) => update('content_format', e.target.value)} placeholder="Reel, article, short..." /></label>
                <label>Tone<select value={form.tone} onChange={(e) => update('tone', e.target.value)}>{['Professional', 'Conversational', 'Educational', 'Witty', 'Inspirational', 'Casual'].map((x) => <option key={x}>{x}</option>)}</select></label>
                <label>Number of ideas<input type="number" min="1" max="10" value={form.number} onChange={(e) => update('number', e.target.value)} /></label>
              </>
            )}
            {kind === 'script' && (
              <>
                <label>Platform<select value={form.platform} onChange={(e) => update('platform', e.target.value)}>{['Instagram Reels', 'YouTube Shorts', 'YouTube long videos', 'TikTok', 'Podcasts', 'Educational videos', 'Promotional videos'].map((x) => <option key={x}>{x}</option>)}</select></label>
                <label>Topic<input required value={form.topic} onChange={(e) => update('topic', e.target.value)} /></label>
                <label>Duration<select value={form.duration} onChange={(e) => update('duration', e.target.value)}>{['30 seconds', '60 seconds', '3 minutes', '10 minutes'].map((x) => <option key={x}>{x}</option>)}</select></label>
                <label>Content style<input value={form.style} onChange={(e) => update('style', e.target.value)} /></label>
                <label>Tone<input value={form.tone} onChange={(e) => update('tone', e.target.value)} /></label>
                <label>Target audience<input value={form.target_audience} onChange={(e) => update('target_audience', e.target.value)} /></label>
                <label>Language<input value={form.language} onChange={(e) => update('language', e.target.value)} /></label>
                <label>Additional instructions<input value={form.additional_instructions} onChange={(e) => update('additional_instructions', e.target.value)} /></label>
              </>
            )}
            {kind === 'caption' && (
              <>
                <label>Topic<input required value={form.topic} onChange={(e) => update('topic', e.target.value)} /></label>
                <label>Platform<select value={form.platform} onChange={(e) => update('platform', e.target.value)}>{['Instagram', 'YouTube', 'TikTok', 'LinkedIn', 'X', 'Pinterest'].map((x) => <option key={x}>{x}</option>)}</select></label>
                <label>Tone<input value={form.tone} onChange={(e) => update('tone', e.target.value)} /></label>
                <label>Caption length<select value={form.length} onChange={(e) => update('length', e.target.value)}>{['Short', 'Medium', 'Long'].map((x) => <option key={x}>{x}</option>)}</select></label>
                <label>Keywords<input value={form.keywords} onChange={(e) => update('keywords', e.target.value)} placeholder="comma-separated" /></label>
                <label>Language<input value={form.language} onChange={(e) => update('language', e.target.value)} /></label>
              </>
            )}
            {error && <div className="form-error" role="alert">{error}</div>}
            {notice && <div className="form-notice" role="status">{notice}</div>}
            <button className="btn primary full" onClick={generate} disabled={loading || !form.topic.trim()}>
              <Sparkles size={16} />{loading ? 'Generating...' : 'Generate'}
            </button>
          </div>
        </section>
        <section className="card output-card">
          <div className="card-header">
            <h2>Generated output</h2>
            {data && <button className="text-button" onClick={copy}><Copy size={14} />Copy</button>}
          </div>
          {data
            ? <GeneratedOutput kind={kind} data={data} />
            : <div className="empty-state"><Sparkles /><h3>{loading ? 'Creating your content...' : 'Ready to create'}</h3><p>{loading ? 'The AI is working on your request.' : 'Enter a topic to generate ideas, scripts, or captions.'}</p></div>}
        </section>
      </div>
    </>
  )
}

function GeneratedOutput({ kind, data }) {
  if (kind === 'idea') {
    return <div className="generated-list">{(data.ideas || []).map((idea, index) => (
      <article className="generated-item" key={`${idea.title}-${index}`}>
        <h3>{idea.title}</h3><p>{idea.idea}</p>
        <strong>Hook</strong><p>{idea.hook}</p>
        <strong>Format · {idea.format}</strong>
        <p>{idea.description}</p>
        <strong>Call to action</strong><p>{idea.call_to_action}</p>
      </article>
    ))}</div>
  }
  if (kind === 'script') {
    return <div className="generated-list"><article className="generated-item">
      <h3>{data.title}</h3>
      {[
        ['Opening hook', data.opening_hook],
        ['Introduction', data.introduction],
        ['Main content', data.main_content],
        ['Scene suggestions', data.scene_suggestions?.join('\n')],
        ['Narration', data.dialogue_or_narration],
        ['Closing', data.closing],
        ['Call to action', data.call_to_action],
      ].map(([label, value]) => <section key={label}><strong>{label}</strong><p>{value}</p></section>)}
    </article></div>
  }
  return <div className="generated-list">{[
    ['Caption variations', data.captions],
    ['Hashtags', data.hashtags],
    ['Calls to action', data.calls_to_action],
    ['Alternative hooks', data.hooks],
  ].map(([label, values]) => <section className="generated-item" key={label}><h3>{label}</h3>{(values || []).map((value, index) => <p key={`${label}-${index}`}>{value}</p>)}</section>)}</div>
}
