import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, ArrowRight } from 'lucide-react'
import CreatorVideoBackground from '../components/CreatorVideoBackground'
import { api, apiIsConfigured } from '../services/api'

function getErrorMessage(error) {
  const data = error.response?.data
  if (typeof data === 'string') return data
  if (data?.detail) return data.detail
  const validationMessage = data && Object.values(data).flatMap((value) => Array.isArray(value) ? value : [value]).find((value) => typeof value === 'string')
  return validationMessage || (error.response
    ? `The server couldn't complete that request (${error.response.status}). Please try again.`
    : !apiIsConfigured
      ? 'This website is not connected to its hosted API yet. Set VITE_API_BASE_URL in the frontend hosting settings and redeploy.'
      : "Can't reach the ContentRocket server. Check that the API is running, then try again.")
}

export default function Auth({ mode }) {
  const { login, register } = useAuth()
  const navigate = useNavigate()
  const { uid, token } = useParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [resetPath, setResetPath] = useState('')
  const [loading, setLoading] = useState(false)
  const [complete, setComplete] = useState(false)
  const isRegister = mode === 'register'
  const isForgot = mode === 'forgot'
  const isReset = mode === 'reset'

  const submit = async (event) => {
    event.preventDefault()
    setError('')
    setNotice('')
    if (isForgot && (!email || !email.includes('@'))) return setError('Enter a valid email address.')
    if (!isForgot && password.length < 8) return setError('Password must be at least 8 characters.')
    if (isReset && password !== confirmPassword) return setError('The passwords do not match.')

    setLoading(true)
    try {
      if (isRegister) {
        await register(email, password)
        navigate('/onboarding')
      } else if (isForgot) {
        const response = await api.post('/auth/password-reset/', { email })
        setNotice(response.data.detail)
        if (response.data.debug_reset_url) setResetPath(new URL(response.data.debug_reset_url).pathname)
      } else if (isReset) {
        await api.post('/auth/password-reset/confirm/', { uid, token, password })
        setComplete(true)
        setNotice('Your password has been updated. You can log in with the new password.')
      } else {
        await login(email, password)
        navigate('/app')
      }
    } catch (requestError) {
      setError(getErrorMessage(requestError))
    } finally {
      setLoading(false)
    }
  }

  const heading = isForgot ? 'Reset your password' : isReset ? 'Choose a new password' : isRegister ? 'Create your account' : 'Welcome back'
  const description = isForgot ? 'Enter your account email and we’ll send reset instructions.' : isReset ? 'Choose a new password for your ContentRocket account.' : isRegister ? 'Start managing your creator business.' : 'Sign in to continue to your workspace.'

  return <main className="auth-page"><CreatorVideoBackground /><form className="auth-card" onSubmit={submit}>
    <Link className="brand" to="/">Content<span>Rocket</span></Link>
    <h1>{heading}</h1>
    <p>{description}</p>
    {error && <div className="form-error" role="alert">{error}</div>}
    {notice && <div className="form-notice" role="status">{notice}</div>}
    {resetPath && <Link className="btn ghost reset-link" to={resetPath}>Open local reset link <ArrowRight size={15} /></Link>}
    {!complete && <>
      {!isReset && <label>Email address<div className="input-wrap"><Mail size={17} /><input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" /></div></label>}
      {!isForgot && <label>{isReset ? 'New password' : 'Password'}<div className="input-wrap"><Lock size={17} /><input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" autoComplete={isRegister || isReset ? 'new-password' : 'current-password'} /></div></label>}
      {isReset && <label>Confirm new password<div className="input-wrap"><Lock size={17} /><input type="password" required minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Enter the new password again" autoComplete="new-password" /></div></label>}
      {!isRegister && !isForgot && !isReset && <Link className="forgot" to="/forgot-password">Forgot password?</Link>}
      <button className="btn primary full" disabled={loading}>{loading ? 'Please wait…' : isForgot ? 'Send reset link' : isReset ? 'Update password' : isRegister ? 'Create account' : 'Log in'} {!loading && <ArrowRight size={17} />}</button>
    </>}
    {(complete || isForgot) ? <div className="auth-switch"><Link to="/login">Back to log in</Link></div> : <div className="auth-switch">{isRegister ? 'Already have an account?' : 'New to ContentRocket?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Log in' : 'Create account'}</Link></div>}
  </form></main>
}
