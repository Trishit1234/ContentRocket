import { ArrowUpRight, CalendarDays, CheckCircle2, FileText, Plus, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'
import { useEffect, useState } from 'react'

export default function Dashboard(){
 const [profile,setProfile]=useState(null);const [summary,setSummary]=useState(null);const [error,setError]=useState('')
 useEffect(()=>{api.get('/creators/profile/').then(r=>setProfile(r.data.results?.[0]||r.data[0]||null)).catch(()=>{});api.get('/dashboard/').then(r=>setSummary(r.data)).catch(()=>setError('Could not load dashboard metrics.'))},[])
 return <><div className="page-heading"><div><p className="date-label">YOUR WORKSPACE</p><h1>Welcome back{profile?.creator_name?`, ${profile.creator_name}`:''}</h1></div><button className="btn primary"><Plus size={17}/>Create content</button></div>
 {error&&<div className="form-error">{error}</div>}<div className="metric-grid">
  <div className="metric-card"><div className="metric-icon purple"><FileText size={19}/></div><p>Total content</p><strong>{summary?.total_content??'—'}</strong><span>Saved in your workspace</span></div>
  <div className="metric-card"><div className="metric-icon blue"><CalendarDays size={19}/></div><p>Upcoming posts</p><strong>{summary?.upcoming_posts??'—'}</strong><span>Scheduled in your calendar</span></div>
  <div className="metric-card"><div className="metric-icon green"><CheckCircle2 size={19}/></div><p>Completed tasks</p><strong>{summary?.completed_tasks??'—'}</strong><span>From your task list</span></div>
  <div className="metric-card"><div className="metric-icon orange"><ArrowUpRight size={19}/></div><p>Tracked views</p><strong>{summary?Number(summary.total_views).toLocaleString():'—'}</strong><span>Manually entered analytics</span></div>
 </div>
 <div className="dashboard-grid"><section className="card"><div className="card-header"><h2>Recent content</h2><Link className="text-button" to="/app/calendar">View calendar</Link></div>{summary?.recent_content?.length?<div className="dashboard-list">{summary.recent_content.map(x=><div key={x.id}><span>{x.title}</span><small>{x.platform} · {x.status}</small></div>)}</div>:<div className="empty-state"><FileText/><h3>No content yet</h3><p>Create your first idea, script or caption.</p><Link className="btn primary" to="/app/studio"><Sparkles size={16}/>Open AI Studio</Link></div>}</section><section className="card"><div className="card-header"><h2>Upcoming deadlines</h2></div>{summary?.upcoming_deadlines?.length?<div className="dashboard-list">{summary.upcoming_deadlines.map(x=><div key={x.id}><span>{x.title}</span><small>{new Date(`${x.date}T00:00:00`).toLocaleDateString()}</small></div>)}</div>:<div className="empty-state small"><CalendarDays/><h3>All clear</h3><p>No upcoming deadlines.</p></div>}</section></div></>
}
