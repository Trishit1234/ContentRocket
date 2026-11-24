import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, ArrowRight } from 'lucide-react'

export default function Auth({ mode }) {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const [email,setEmail]=useState('')
  const [password,setPassword]=useState('')
  const [error,setError]=useState('')
  const [loading,setLoading]=useState(false)
  const isRegister=mode==='register'
  const isForgot=mode==='forgot'

  const submit=async(e)=>{
    e.preventDefault()
    if (!email || !email.includes('@')) return setError('Enter a valid email address.')
    if (!isForgot && password.length < 8) return setError('Password must be at least 8 characters.')
    setLoading(true); setError('')
    try {
      if (isRegister) { await register(email,password); navigate('/onboarding') }
      else if (!isForgot) { await login(email,password); navigate('/app') }
      else setError('Password reset is not connected. Please contact support.')
    } catch (e) {
      const data=e.response?.data
      setError(typeof data==='string'?data:(data?.detail||data?.password?.[0]||data?.email?.[0]||'Unable to complete your request.'))
    } finally { setLoading(false) }
  }
  return <main className="auth-page"><form className="auth-card" onSubmit={submit}>
    <Link className="brand" to="/">Content<span>Rocket</span></Link>
    <h1>{isForgot?'Reset your password':isRegister?'Create your account':'Welcome back'}</h1>
    <p>{isForgot?'Enter your email to request reset instructions.':isRegister?'Start managing your creator business.':'Sign in to continue to your workspace.'}</p>
    {error&&<div className="form-error">{error}</div>}
    <label>Email address<div className="input-wrap"><Mail size={17}/><input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com"/></div></label>
    {!isForgot&&<label>Password<div className="input-wrap"><Lock size={17}/><input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters"/></div></label>}
    {!isRegister&&!isForgot&&<Link className="forgot" to="/forgot-password">Forgot password?</Link>}
    <button className="btn primary full" disabled={loading}>{loading?'Please wait':isForgot?'Send reset link':isRegister?'Create account':'Log in'} {!loading&&<ArrowRight size={17}/>}</button>
    <div className="auth-switch">{isRegister?'Already have an account?':'New to ContentRocket?' } <Link to={isRegister?'/login':'/register'}>{isRegister?'Log in':'Create account'}</Link></div>
  </form></main>
}
