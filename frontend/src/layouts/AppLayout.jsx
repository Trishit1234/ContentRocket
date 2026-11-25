import { useEffect, useRef, useState } from 'react'
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Sparkles, Clapperboard, Captions, CalendarDays, Library, BarChart3, Handshake, ListTodo, Search, UserRound, Settings, Bell, Plus, LogOut, PanelLeft, X } from 'lucide-react'
import CreatorVideoBackground from '../components/CreatorVideoBackground'
import { api } from '../services/api'

const nav = [
  ['Overview', '', LayoutDashboard], ['AI Content Studio', 'studio', Sparkles],
  ['Script Writer', 'scripts', Clapperboard], ['Caption Generator', 'captions', Captions],
  ['Content Calendar', 'calendar', CalendarDays], ['Content Library', 'library', Library],
  ['Analytics', 'analytics', BarChart3], ['Brand Deals', 'brands', Handshake],
  ['Tasks', 'tasks', ListTodo], ['Competitor Research', 'competitors', Search],
  ['My Profile', 'profile', UserRound], ['Settings', 'settings', Settings],
]

const searchSources = [
  { endpoint: '/content/assets/', route: '/app/library', title: (item) => item.title, detail: (item) => item.asset_type },
  { endpoint: '/calendar/posts/', route: '/app/calendar', title: (item) => item.title, detail: (item) => `${item.platform} · ${item.scheduled_date}` },
  { endpoint: '/tasks/tasks/', route: '/app/tasks', title: (item) => item.title, detail: (item) => item.status },
  { endpoint: '/collaborations/brands/', route: '/app/brands', title: (item) => item.brand_name, detail: (item) => item.campaign_title },
  { endpoint: '/competitors/profiles/', route: '/app/competitors', title: (item) => item.name, detail: (item) => item.platform },
]

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [quickOpen, setQuickOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [deadlines, setDeadlines] = useState([])
  const quickRef = useRef(null)
  const notificationsRef = useRef(null)

  useEffect(() => {
    if (search.trim().length < 2) {
      setSearchResults([])
      setSearching(false)
      return undefined
    }
    let active = true
    setSearching(true)
    const timer = window.setTimeout(async () => {
      const results = await Promise.all(searchSources.map(async (source) => {
        try {
          const response = await api.get(source.endpoint)
          const items = response.data.results || response.data
          return items.filter((item) => `${source.title(item) || ''} ${source.detail(item) || ''}`.toLowerCase().includes(search.trim().toLowerCase()))
            .slice(0, 4).map((item) => ({ title: source.title(item), detail: source.detail(item), route: source.route, id: item.id }))
        } catch {
          return []
        }
      }))
      if (active) {
        setSearchResults(results.flat().slice(0, 8))
        setSearching(false)
      }
    }, 250)
    return () => { active = false; window.clearTimeout(timer) }
  }, [search])

  useEffect(() => {
    api.get('/dashboard/').then((response) => setDeadlines(response.data.upcoming_deadlines || [])).catch(() => {})
  }, [])

  useEffect(() => {
    const closeMenus = (event) => {
      if (!quickRef.current?.contains(event.target)) setQuickOpen(false)
      if (!notificationsRef.current?.contains(event.target)) setNotificationsOpen(false)
    }
    document.addEventListener('mousedown', closeMenus)
    return () => document.removeEventListener('mousedown', closeMenus)
  }, [])

  const signOut = () => { logout(); navigate('/') }
  const openResult = (result) => { navigate(`${result.route}?search=${encodeURIComponent(result.title)}`); setSearch(''); setSearchResults([]) }

  return (
    <div className="app-shell">
      <CreatorVideoBackground />
      <aside className={`sidebar${mobileOpen ? ' mobile-open' : ''}`}>
        <div className="brand">Content<span>Rocket</span></div>
        <nav>{nav.map(([label, path, Icon]) => <NavLink key={path} to={path ? `/app/${path}` : '/app'} end onClick={() => setMobileOpen(false)}><Icon size={18} /><span>{label}</span></NavLink>)}</nav>
        <button className="sidebar-logout" onClick={signOut}><LogOut size={17} />Log out</button>
      </aside>
      {mobileOpen && <button aria-label="Close navigation" className="mobile-overlay" onClick={() => setMobileOpen(false)} />}
      <div className="app-main">
        <header className="topbar">
          <button className="mobile-menu" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><PanelLeft size={19} /></button>
          <div className="search search-box">
            <Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === 'Escape') { setSearch(''); setSearchResults([]) } }} placeholder="Search your workspace" aria-label="Search your workspace" />
            {search.trim().length >= 2 && <div className="search-results" role="listbox">
              {searching ? <div className="search-message">Searching your workspace…</div> : searchResults.length ? searchResults.map((result) => <button key={`${result.route}-${result.id}`} onClick={() => openResult(result)} role="option"><strong>{result.title}</strong><small>{result.detail || result.route.replace('/app/', '')}</small></button>) : <div className="search-message">No matching content found.</div>}
            </div>}
          </div>
          <div className="top-actions">
            <div className="menu-anchor" ref={notificationsRef}>
              <button className="icon-button" aria-label="Notifications" aria-expanded={notificationsOpen} onClick={() => setNotificationsOpen((open) => !open)}><Bell size={19} />{deadlines.length > 0 && <i />}</button>
              {notificationsOpen && <div className="top-popover notification-popover"><div className="popover-heading"><strong>Upcoming deadlines</strong><button aria-label="Close notifications" onClick={() => setNotificationsOpen(false)}><X size={15} /></button></div>{deadlines.length ? deadlines.map((item) => <Link key={item.id} to="/app/calendar" onClick={() => setNotificationsOpen(false)}><span>{item.title}</span><small>{new Date(`${item.date}T00:00:00`).toLocaleDateString()}</small></Link>) : <p>You’re all caught up. No upcoming deadlines.</p>}<Link className="popover-footer" to="/app/calendar" onClick={() => setNotificationsOpen(false)}>Open calendar</Link></div>}
            </div>
            <div className="menu-anchor" ref={quickRef}>
              <button className="quick-create" aria-expanded={quickOpen} onClick={() => setQuickOpen((open) => !open)}><Plus size={17} />Quick create</button>
              {quickOpen && <div className="top-popover quick-popover"><strong>Create something</strong><Link to="/app/studio" onClick={() => setQuickOpen(false)}><Sparkles size={16} />Content ideas</Link><Link to="/app/scripts" onClick={() => setQuickOpen(false)}><Clapperboard size={16} />Video script</Link><Link to="/app/captions" onClick={() => setQuickOpen(false)}><Captions size={16} />Caption</Link><Link to="/app/calendar?new=1" onClick={() => setQuickOpen(false)}><CalendarDays size={16} />Calendar post</Link><Link to="/app/tasks?new=1" onClick={() => setQuickOpen(false)}><ListTodo size={16} />Task</Link></div>}
            </div>
            <Link className="avatar avatar-link" to="/app/profile" aria-label="Open creator profile">{(user?.first_name || user?.email || 'U')[0].toUpperCase()}</Link>
          </div>
        </header>
        <main className="app-content"><Outlet /></main>
      </div>
    </div>
  )
}
