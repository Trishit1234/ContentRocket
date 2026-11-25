import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Trash2, Pencil, Search, ChevronLeft, ChevronRight, Activity } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { api } from '../services/api'

function errorText(error, fallback) {
  const data = error.response?.data
  if (typeof data === 'string') return data
  if (data?.detail) return data.detail
  const first = data && Object.values(data).flatMap((value) => Array.isArray(value) ? value : [value]).find((value) => typeof value === 'string')
  return first || (error.response ? `${fallback} (${error.response.status}).` : 'Can’t connect to the server. Check the API connection and try again.')
}

function dateValue(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function CrudPage({ title, endpoint, fields, columns, initial = {} }) {
  const [items, setItems] = useState([])
  const [form, setForm] = useState(initial)
  const [editing, setEditing] = useState(null)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState('')
  const [nextPage, setNextPage] = useState(null)
  const nextPageRef = useRef(null)
  const [selectedCompetitor, setSelectedCompetitor] = useState(null)
  const [observations, setObservations] = useState([])
  const [observationOpen, setObservationOpen] = useState(false)
  const [observationLoading, setObservationLoading] = useState(false)
  const [observationSaving, setObservationSaving] = useState(false)
  const [observationError, setObservationError] = useState('')
  const [observationForm, setObservationForm] = useState({ content_title: '', content_url: '', views: 0, likes: 0, comments: 0, content_format: '', date_observed: dateValue(new Date()) })
  const [searchParams, setSearchParams] = useSearchParams()
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1))

  const load = useCallback(async (append = false) => {
    setLoading(true)
    setError('')
    try {
      const response = await api.get(append && nextPageRef.current ? nextPageRef.current : endpoint)
      const results = response.data.results || response.data
      setItems((current) => append ? [...current, ...results] : results)
      nextPageRef.current = response.data.next || null
      setNextPage(nextPageRef.current)
    } catch (requestError) {
      setError(errorText(requestError, 'Could not load records'))
    } finally {
      setLoading(false)
    }
  }, [endpoint])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const hasNew = searchParams.get('new') === '1'
    const requestedSearch = searchParams.get('search')
    if (!hasNew && !requestedSearch) return
    if (hasNew) {
      setEditing(null)
      setForm(initial)
      setOpen(true)
    }
    if (requestedSearch) setSearch(requestedSearch)
    const updated = new URLSearchParams(searchParams)
    updated.delete('new')
    updated.delete('search')
    setSearchParams(updated, { replace: true })
  }, [searchParams, setSearchParams])

  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const filteredItems = useMemo(() => {
    const needle = search.trim().toLowerCase()
    if (!needle) return items
    return items.filter((item) => columns.some((column) => String(item[column.key] ?? '').toLowerCase().includes(needle)))
  }, [items, columns, search])

  const openNew = (scheduledDate = '') => {
    setEditing(null)
    setForm({ ...initial, ...(scheduledDate ? { scheduled_date: scheduledDate } : {}) })
    setError('')
    setOpen(true)
  }

  const submit = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (editing) await api.patch(`${endpoint}${editing}/`, form)
      else await api.post(endpoint, form)
      setOpen(false)
      setEditing(null)
      setForm(initial)
      setNotice(editing ? 'Changes saved.' : 'Added to your workspace.')
      await load()
    } catch (requestError) {
      setError(errorText(requestError, 'Could not save record'))
    } finally {
      setSaving(false)
    }
  }

  const edit = (item) => {
    setEditing(item.id)
    setForm(Object.fromEntries(fields.map((field) => [field.key, item[field.key] ?? (field.type === 'checkbox' ? false : '')])))
    setError('')
    setOpen(true)
  }

  const remove = async (id) => {
    if (!window.confirm('Delete this record?')) return
    setError('')
    try {
      await api.delete(`${endpoint}${id}/`)
      setNotice('Record deleted.')
      await load()
    } catch (requestError) {
      setError(errorText(requestError, 'Could not delete record'))
    }
  }

  const openObservations = async (competitor) => {
    setSelectedCompetitor(competitor)
    setObservationOpen(true)
    setObservationLoading(true)
    setObservationError('')
    try {
      const response = await api.get('/competitors/observations/')
      const records = response.data.results || response.data
      setObservations(records.filter((record) => record.competitor === competitor.id))
    } catch (requestError) {
      setObservationError(errorText(requestError, 'Could not load observations'))
    } finally { setObservationLoading(false) }
  }

  const saveObservation = async (event) => {
    event.preventDefault()
    setObservationSaving(true)
    setObservationError('')
    try {
      const response = await api.post('/competitors/observations/', { ...observationForm, competitor: selectedCompetitor.id })
      setObservations((current) => [response.data, ...current])
      setObservationForm({ content_title: '', content_url: '', views: 0, likes: 0, comments: 0, content_format: '', date_observed: dateValue(new Date()) })
    } catch (requestError) {
      setObservationError(errorText(requestError, 'Could not save observation'))
    } finally { setObservationSaving(false) }
  }

  const calendarCells = useMemo(() => {
    if (title !== 'Content Calendar') return []
    const first = new Date(month.getFullYear(), month.getMonth(), 1)
    const start = new Date(first)
    start.setDate(first.getDate() - first.getDay())
    return Array.from({ length: 42 }, (_, index) => {
      const day = new Date(start)
      day.setDate(start.getDate() + index)
      const key = dateValue(day)
      return { date: day, key, inMonth: day.getMonth() === month.getMonth(), posts: items.filter((item) => item.scheduled_date === key) }
    })
  }, [items, month, title])

  const analytics = title === 'Analytics'
    ? {
        views: items.reduce((sum, item) => sum + Number(item.views || 0), 0),
        engagements: items.reduce((sum, item) => sum + Number(item.likes || 0) + Number(item.comments || 0) + Number(item.shares || 0) + Number(item.saves || 0), 0),
        followers: items.reduce((sum, item) => sum + Number(item.followers_gained || 0), 0),
        chart: [...filteredItems].sort((a, b) => Number(b.views || 0) - Number(a.views || 0)).slice(0, 8).map((item) => ({ name: item.content_title?.length > 18 ? `${item.content_title.slice(0, 18)}…` : item.content_title, views: Number(item.views || 0) })),
      }
    : null
  const entityName = ({ 'Brand Collaborations': 'Brand Deal', 'Content Calendar': 'Calendar Post', Analytics: 'Performance Record', 'Content Library': 'Library Item', 'Competitor Research': 'Competitor' })[title] || title.replace(/s$/, '')

  return <>
    <div className="page-heading"><div><p className="date-label">WORKSPACE</p><h1>{title}</h1></div><button className="btn primary" onClick={() => openNew()}><Plus size={16} />Add new</button></div>
    {error && <div className="form-error" role="alert">{error}</div>}{notice && <div className="form-notice" role="status">{notice}</div>}

    {title === 'Content Calendar' && <section className="card calendar-panel">
      <div className="calendar-toolbar"><div><p className="date-label">PLAN AHEAD</p><h2>{month.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</h2></div><div className="calendar-arrows"><button className="icon-button" aria-label="Previous month" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1))}><ChevronLeft size={18} /></button><button className="icon-button" aria-label="Next month" onClick={() => setMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1))}><ChevronRight size={18} /></button><button className="btn ghost" onClick={() => setMonth(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}>Today</button></div></div>
      <div className="calendar-grid">{['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => <div className="calendar-weekday" key={day}>{day}</div>)}{calendarCells.map((cell) => <button key={cell.key} className={`calendar-day${cell.inMonth ? '' : ' outside'}${cell.key === dateValue(new Date()) ? ' today' : ''}`} onClick={() => openNew(cell.key)} aria-label={`Add post on ${cell.date.toLocaleDateString()}`}><span>{cell.date.getDate()}</span>{cell.posts.slice(0, 2).map((post) => <i key={post.id} title={post.title}>{post.title}</i>)}{cell.posts.length > 2 && <small>+{cell.posts.length - 2} more</small>}</button>)}</div>
    </section>}

    {analytics && <section className="analytics-panel">
      <div className="analytics-stats"><article className="metric-card"><p>Total views tracked</p><strong>{analytics.views.toLocaleString()}</strong><span>Across {items.length} published posts</span></article><article className="metric-card"><p>Engagements</p><strong>{analytics.engagements.toLocaleString()}</strong><span>Likes, comments, shares and saves</span></article><article className="metric-card"><p>Followers gained</p><strong>{analytics.followers.toLocaleString()}</strong><span>Entered in your performance log</span></article></div>
      <section className="card analytics-chart"><div className="card-header"><h2>Top posts by views</h2></div>{analytics.chart.length ? <div className="chart-area"><ResponsiveContainer width="100%" height="100%"><BarChart data={analytics.chart} margin={{ top: 12, right: 18, left: 4, bottom: 8 }}><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eeeaf4" /><XAxis dataKey="name" tick={{ fontSize: 11, fill: '#777287' }} axisLine={false} tickLine={false} /><YAxis tick={{ fontSize: 11, fill: '#938da0' }} axisLine={false} tickLine={false} /><Tooltip /><Bar dataKey="views" fill="#8060dc" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer></div> : <div className="empty-table">Add performance records to see your views chart.</div>}</section>
    </section>}

    <section className="card data-card"><div className="data-toolbar"><div><strong>{title === 'Analytics' ? 'Performance records' : title === 'Content Calendar' ? 'All scheduled content' : 'Your records'}</strong><span>{filteredItems.length} shown</span></div><label className="table-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search ${title.toLowerCase()}…`} /></label></div>
      <div className="data-table"><div className="table-row table-head">{columns.map((column) => <div key={column.key}>{column.label}</div>)}<div>Actions</div></div>{filteredItems.length ? filteredItems.map((item) => <div className="table-row" key={item.id}>{columns.map((column) => <div key={column.key}>{column.render ? column.render(item[column.key], item) : String(item[column.key] ?? '—')}</div>)}<div className="row-actions">{title === 'Competitor Research' && <button aria-label={`View observations for ${item.name}`} title="Log content observations" onClick={() => openObservations(item)}><Activity size={15} /></button>}<button aria-label={`Edit ${item.title || item.brand_name || item.content_title || 'record'}`} onClick={() => edit(item)}><Pencil size={15} /></button><button aria-label={`Delete ${item.title || item.brand_name || item.content_title || 'record'}`} onClick={() => remove(item.id)}><Trash2 size={15} /></button></div></div>) : <div className="empty-table">{loading ? 'Loading records…' : search ? 'No records match that search.' : 'No records yet. Add your first one to get started.'}</div>}</div>
      {nextPage && <div className="load-more"><button className="btn ghost" onClick={() => load(true)} disabled={loading}>{loading ? 'Loading…' : 'Load more'}</button></div>}
    </section>

    {open && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}><form className="modal card" onSubmit={submit}><div className="card-header"><h2>{editing ? 'Edit' : 'Add'} {entityName}</h2></div><div className="modal-form">{fields.map((field) => <label className={field.wide ? 'full-field' : ''} key={field.key}>{field.label}{field.type === 'select' ? <select required={field.required} value={form[field.key] ?? ''} onChange={(event) => update(field.key, event.target.value)}>{field.options.map((option) => <option value={option} key={option}>{option}</option>)}</select> : field.type === 'textarea' ? <textarea required={field.required} value={form[field.key] ?? ''} onChange={(event) => update(field.key, event.target.value)} /> : field.type === 'checkbox' ? <input type="checkbox" checked={Boolean(form[field.key])} onChange={(event) => update(field.key, event.target.checked)} /> : <input required={field.required} type={field.type || 'text'} min={field.min} value={form[field.key] ?? ''} onChange={(event) => update(field.key, event.target.value)} />}</label>)}</div>{error && <div className="form-error" role="alert">{error}</div>}<div className="modal-actions"><button type="button" className="btn ghost" onClick={() => setOpen(false)}>Cancel</button><button className="btn primary" disabled={saving}>{saving ? 'Saving…' : editing ? 'Save changes' : 'Create'}</button></div></form></div>}
    {observationOpen && <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && setObservationOpen(false)}><section className="modal card observation-modal"><div className="card-header"><div><h2>Content observations</h2><small>{selectedCompetitor?.name}</small></div><button type="button" className="icon-button" aria-label="Close observations" onClick={() => setObservationOpen(false)}>×</button></div><div className="observation-list">{observationLoading ? <p>Loading observations…</p> : observations.length ? observations.map((observation) => <article key={observation.id}><div><strong>{observation.content_title}</strong><small>{observation.date_observed} · {observation.content_format || 'Unspecified format'}</small></div><span>{Number(observation.views).toLocaleString()} views</span></article>) : <p>No observations logged yet. Track a post to start comparing content.</p>}</div><form onSubmit={saveObservation}><div className="modal-form"><label>Post title<input required value={observationForm.content_title} onChange={(event) => setObservationForm((current) => ({ ...current, content_title: event.target.value }))} /></label><label>Date observed<input type="date" required value={observationForm.date_observed} onChange={(event) => setObservationForm((current) => ({ ...current, date_observed: event.target.value }))} /></label><label>Views<input type="number" min="0" value={observationForm.views} onChange={(event) => setObservationForm((current) => ({ ...current, views: event.target.value }))} /></label><label>Likes<input type="number" min="0" value={observationForm.likes} onChange={(event) => setObservationForm((current) => ({ ...current, likes: event.target.value }))} /></label><label>Comments<input type="number" min="0" value={observationForm.comments} onChange={(event) => setObservationForm((current) => ({ ...current, comments: event.target.value }))} /></label><label>Format<input value={observationForm.content_format} onChange={(event) => setObservationForm((current) => ({ ...current, content_format: event.target.value }))} placeholder="Reel, tutorial, carousel…" /></label><label className="full-field">Post URL<input type="url" value={observationForm.content_url} onChange={(event) => setObservationForm((current) => ({ ...current, content_url: event.target.value }))} /></label></div>{observationError && <div className="form-error" role="alert">{observationError}</div>}<div className="modal-actions"><button className="btn primary" disabled={observationSaving}>{observationSaving ? 'Saving…' : 'Save observation'}</button></div></form></section></div>}
  </>
}

const platforms = ['Instagram', 'YouTube', 'TikTok', 'Facebook', 'LinkedIn', 'X', 'Pinterest', 'Blog', 'Podcast']
export function CalendarPage() { return <CrudPage title="Content Calendar" endpoint="/calendar/posts/" initial={{ title: '', platform: 'Instagram', scheduled_date: '', scheduled_time: '', content_type: '', description: '', status: 'Idea' }} fields={[{ key: 'title', label: 'Title', required: true }, { key: 'platform', label: 'Platform', type: 'select', options: platforms }, { key: 'scheduled_date', label: 'Scheduled date', type: 'date', required: true }, { key: 'scheduled_time', label: 'Scheduled time', type: 'time' }, { key: 'content_type', label: 'Content type' }, { key: 'description', label: 'Description', type: 'textarea', wide: true }, { key: 'status', label: 'Status', type: 'select', options: ['Idea', 'Draft', 'In Progress', 'Ready', 'Scheduled', 'Published'] }]} columns={[{ key: 'title', label: 'Title' }, { key: 'platform', label: 'Platform' }, { key: 'scheduled_date', label: 'Date' }, { key: 'status', label: 'Status' }]} /> }
export function LibraryPage() { return <CrudPage title="Content Library" endpoint="/content/assets/" initial={{ title: '', asset_type: 'idea', body: '', category: '', favorite: false }} fields={[{ key: 'title', label: 'Title', required: true }, { key: 'asset_type', label: 'Type', type: 'select', options: ['idea', 'script', 'caption', 'draft', 'reference'] }, { key: 'body', label: 'Content', type: 'textarea', wide: true }, { key: 'category', label: 'Category' }, { key: 'favorite', label: 'Favorite', type: 'checkbox' }]} columns={[{ key: 'title', label: 'Title' }, { key: 'asset_type', label: 'Type' }, { key: 'category', label: 'Category' }, { key: 'favorite', label: 'Favorite', render: (value) => value ? '★' : '—' }]} /> }
export function AnalyticsPage() { return <CrudPage title="Analytics" endpoint="/analytics/performance/" initial={{ platform: 'Instagram', content_title: '', views: 0, likes: 0, comments: 0, shares: 0, saves: 0, followers_gained: 0, publication_date: '' }} fields={[{ key: 'platform', label: 'Platform', type: 'select', options: platforms }, { key: 'content_title', label: 'Content title', required: true }, { key: 'views', label: 'Views', type: 'number', min: 0 }, { key: 'likes', label: 'Likes', type: 'number', min: 0 }, { key: 'comments', label: 'Comments', type: 'number', min: 0 }, { key: 'shares', label: 'Shares', type: 'number', min: 0 }, { key: 'saves', label: 'Saves', type: 'number', min: 0 }, { key: 'followers_gained', label: 'Followers gained', type: 'number' }, { key: 'publication_date', label: 'Publication date', type: 'date', required: true }]} columns={[{ key: 'content_title', label: 'Content' }, { key: 'platform', label: 'Platform' }, { key: 'views', label: 'Views' }, { key: 'engagement_rate', label: 'Engagement', render: (value) => `${Number(value || 0).toFixed(2)}%` }]} /> }
export function BrandsPage() { return <CrudPage title="Brand Collaborations" endpoint="/collaborations/brands/" initial={{ brand_name: '', contact_person: '', email: '', campaign_title: '', deal_amount: 0, platform: '', deadline: '', notes: '', payment_status: 'Pending', collaboration_status: 'Lead' }} fields={[{ key: 'brand_name', label: 'Brand name', required: true }, { key: 'contact_person', label: 'Contact person' }, { key: 'email', label: 'Email', type: 'email' }, { key: 'campaign_title', label: 'Campaign title' }, { key: 'deal_amount', label: 'Deal amount', type: 'number', min: 0 }, { key: 'platform', label: 'Platform' }, { key: 'deadline', label: 'Deadline', type: 'date' }, { key: 'notes', label: 'Notes', type: 'textarea', wide: true }, { key: 'payment_status', label: 'Payment status', type: 'select', options: ['Pending', 'Partially Paid', 'Paid'] }, { key: 'collaboration_status', label: 'Collaboration status', type: 'select', options: ['Lead', 'Contacted', 'Negotiating', 'Confirmed', 'Completed', 'Rejected'] }]} columns={[{ key: 'brand_name', label: 'Brand' }, { key: 'campaign_title', label: 'Campaign' }, { key: 'deal_amount', label: 'Amount' }, { key: 'collaboration_status', label: 'Status' }]} /> }
export function TasksPage() { return <CrudPage title="Tasks" endpoint="/tasks/tasks/" initial={{ title: '', description: '', deadline: '', priority: 'Medium', status: 'To Do' }} fields={[{ key: 'title', label: 'Title', required: true }, { key: 'description', label: 'Description', type: 'textarea', wide: true }, { key: 'deadline', label: 'Deadline', type: 'date' }, { key: 'priority', label: 'Priority', type: 'select', options: ['Low', 'Medium', 'High'] }, { key: 'status', label: 'Status', type: 'select', options: ['To Do', 'In Progress', 'Completed'] }]} columns={[{ key: 'title', label: 'Task' }, { key: 'deadline', label: 'Deadline' }, { key: 'priority', label: 'Priority' }, { key: 'status', label: 'Status' }]} /> }
export function CompetitorsPage() { return <CrudPage title="Competitor Research" endpoint="/competitors/profiles/" initial={{ name: '', platform: 'Instagram', profile_url: '', niche: '', notes: '' }} fields={[{ key: 'name', label: 'Competitor name', required: true }, { key: 'platform', label: 'Platform', type: 'select', options: platforms }, { key: 'profile_url', label: 'Profile URL', type: 'url' }, { key: 'niche', label: 'Niche' }, { key: 'notes', label: 'Notes', type: 'textarea', wide: true }]} columns={[{ key: 'name', label: 'Competitor' }, { key: 'platform', label: 'Platform' }, { key: 'niche', label: 'Niche' }, { key: 'profile_url', label: 'Profile', render: (value) => value ? <a href={value} target="_blank" rel="noreferrer">Open profile ↗</a> : '—' }]} /> }
export function ProfilePage() { return <ProfileSettings mode="profile" /> }
export function SettingsPage() { return <ProfileSettings mode="settings" /> }

function ProfileSettings({ mode }) {
  const [form, setForm] = useState({ creator_name: '', niche: '', primary_platform: '', content_type: '', main_goal: '', bio: '', target_audience: '', preferred_tone: '' })
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    api.get('/creators/profile/').then((response) => {
      const profile = response.data.results?.[0] || response.data[0]
      if (profile) setForm((current) => ({ ...current, ...profile }))
    }).catch((requestError) => setError(errorText(requestError, 'Could not load profile'))).finally(() => setLoading(false))
  }, [])
  const update = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const save = async (event) => {
    event.preventDefault()
    setSaving(true); setError(''); setNotice('')
    try {
      const response = await api.get('/creators/profile/')
      const profile = response.data.results?.[0] || response.data[0]
      if (profile) await api.patch(`/creators/profile/${profile.id}/`, form)
      else await api.post('/creators/profile/', form)
      setNotice('Your creator profile is saved.')
    } catch (requestError) {
      setError(errorText(requestError, 'Could not save profile'))
    } finally { setSaving(false) }
  }
  return <><div className="page-heading"><div><p className="date-label">ACCOUNT</p><h1>{mode === 'profile' ? 'Creator Profile' : 'Settings'}</h1><p className="page-subtitle">Keep your creator details up to date so your workspace and AI drafts fit your voice.</p></div></div><form className="card settings-card" onSubmit={save}><div className="modal-form"><label>Creator name<input required value={form.creator_name || ''} onChange={(event) => update('creator_name', event.target.value)} /></label><label>Niche<input value={form.niche || ''} onChange={(event) => update('niche', event.target.value)} /></label><label>Primary platform<input value={form.primary_platform || ''} onChange={(event) => update('primary_platform', event.target.value)} /></label><label>Content type<input value={form.content_type || ''} onChange={(event) => update('content_type', event.target.value)} /></label><label>Target audience<input value={form.target_audience || ''} onChange={(event) => update('target_audience', event.target.value)} /></label><label>Preferred tone<input value={form.preferred_tone || ''} onChange={(event) => update('preferred_tone', event.target.value)} /></label><label className="full-field">Main creator goal<input value={form.main_goal || ''} onChange={(event) => update('main_goal', event.target.value)} /></label><label className="full-field">Bio<textarea value={form.bio || ''} onChange={(event) => update('bio', event.target.value)} /></label></div>{error && <div className="form-error" role="alert">{error}</div>}{notice && <div className="form-notice" role="status">{notice}</div>}<div className="modal-actions"><button className="btn primary" disabled={saving || loading}>{saving ? 'Saving…' : loading ? 'Loading…' : 'Save changes'}</button></div></form></>
}
