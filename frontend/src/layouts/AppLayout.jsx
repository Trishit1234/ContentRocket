import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, Sparkles, Clapperboard, Captions, CalendarDays, Library, BarChart3, Handshake, ListTodo, Search, UserRound, Settings, Bell, Plus, LogOut, PanelLeft } from 'lucide-react'

const nav=[['Overview','',LayoutDashboard],['AI Content Studio','studio',Sparkles],['Script Writer','scripts',Clapperboard],['Caption Generator','captions',Captions],['Content Calendar','calendar',CalendarDays],['Content Library','library',Library],['Analytics','analytics',BarChart3],['Brand Deals','brands',Handshake],['Tasks','tasks',ListTodo],['Competitor Research','competitors',Search],['My Profile','profile',UserRound],['Settings','settings',Settings]]

export default function AppLayout(){
 const {user,logout}=useAuth(); const navigate=useNavigate()
 const signOut=()=>{logout();navigate('/')}
 return <div className="app-shell"><aside className="sidebar"><div className="brand">Content<span>Rocket</span></div><nav>{nav.map(([label,path,Icon])=><NavLink key={path} to={path?`/app/${path}`:'/app'} end><Icon size={18}/><span>{label}</span></NavLink>)}</nav><button className="sidebar-logout" onClick={signOut}><LogOut size={17}/>Log out</button></aside><div className="app-main"><header className="topbar"><button className="mobile-menu"><PanelLeft size={19}/></button><div className="search"><Search size={17}/><input placeholder="Search your workspace"/></div><div className="top-actions"><button className="icon-button" aria-label="Notifications"><Bell size={19}/><i/></button><button className="quick-create"><Plus size={17}/>Quick create</button><div className="avatar">{(user?.first_name||user?.email||'U')[0].toUpperCase()}</div></div></header><main className="app-content"><Outlet/></main></div></div>
}
