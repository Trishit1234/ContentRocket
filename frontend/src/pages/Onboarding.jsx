import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'

export default function Onboarding(){
 const navigate=useNavigate()
 const [form,setForm]=useState({creator_name:'',niche:'',primary_platform:'',content_type:'',target_audience:'',preferred_tone:'',main_goal:''})
 const [error,setError]=useState('')
 const [loading,setLoading]=useState(false)
 const update=(k,v)=>setForm(p=>({...p,[k]:v}))
 const submit=async(e)=>{e.preventDefault();if(!form.creator_name.trim())return setError('Creator name is required.')
 setLoading(true)
 try{await api.post('/creators/profile/',form);navigate('/app')}catch(e){setError(e.response?.data?.detail||'Could not save your profile.')}finally{setLoading(false)}}
 return <main className="onboarding"><form className="auth-card wide" onSubmit={submit}><div className="brand">Content<span>Rocket</span></div><h1>Build your creator profile</h1><p>Personalize your workspace and AI recommendations.</p>{error&&<div className="form-error">{error}</div>}<div className="form-grid">
  <label>Creator name<input value={form.creator_name} onChange={e=>update('creator_name',e.target.value)} placeholder="Your name or brand"/></label>
  <label>Creator niche<select value={form.niche} onChange={e=>update('niche',e.target.value)}><option value="">Select niche</option>{['Technology','Education','Fitness','Gaming','Fashion','Travel','Food','Lifestyle','Entertainment','Business','Photography','Other'].map(x=><option key={x}>{x}</option>)}</select></label>
  <label>Primary platform<select value={form.primary_platform} onChange={e=>update('primary_platform',e.target.value)}><option value="">Select platform</option>{['Instagram','YouTube','TikTok','Facebook','LinkedIn','X','Pinterest','Blog','Podcast'].map(x=><option key={x}>{x}</option>)}</select></label>
  <label>Content type<input value={form.content_type} onChange={e=>update('content_type',e.target.value)} placeholder="Videos, articles, podcasts..."/></label>
  <label>Target audience<input value={form.target_audience} onChange={e=>update('target_audience',e.target.value)} placeholder="Age, interests, goals..."/></label>
  <label>Preferred tone<select value={form.preferred_tone} onChange={e=>update('preferred_tone',e.target.value)}><option value="">Select tone</option>{['Professional','Conversational','Educational','Witty','Inspirational','Casual'].map(x=><option key={x}>{x}</option>)}</select></label>
  <label className="full-field">Main creator goal<input value={form.main_goal} onChange={e=>update('main_goal',e.target.value)} placeholder="Grow an audience, monetize, build a brand..."/></label>
 </div><button className="btn primary full" disabled={loading}>{loading?'Saving...':'Complete setup'}</button></form></main>
}
