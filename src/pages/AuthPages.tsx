import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Phone, Mail, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { ApiError } from '@/lib/api'
import { getPostAuthPath } from '@/lib/auth-utils'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function LoginPage() {
  const { login, completeOtp, pendingOtp } = useAuth()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (pendingOtp) {
        const profile = await completeOtp(phone, otp)
        navigate(getPostAuthPath(profile.role))
      } else {
        await login({ phone, purpose: 'login' })
        toast.success('Verification code sent — check the API terminal')
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      mode="login"
      title={pendingOtp ? 'Verify your number' : 'Sign in'}
      subtitle={
        pendingOtp
          ? `We sent a code to ${phone || 'your phone'}. Enter it below to continue.`
          : 'Use your mobile number to access your dashboard securely.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {!pendingOtp ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 h-12"
                  placeholder="0810 789 1549"
                  autoComplete="tel"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Or email address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input id="email" className="pl-10 h-12" placeholder="you@email.com" type="email" disabled />
              </div>
              <p className="text-[11px] text-muted-foreground">Email sign-in coming soon — use phone OTP.</p>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="otp">6-digit verification code</Label>
            <Input
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="······"
              maxLength={6}
              className="text-center text-2xl tracking-[0.4em] font-mono h-14"
              autoComplete="one-time-code"
              required
            />
            <p className="text-xs text-muted-foreground text-center pt-1">
              Check the API server terminal for your code (dev mode)
            </p>
          </div>
        )}

        <Button type="submit" className="w-full h-12 text-base gap-2" disabled={submitting}>
          {submitting ? 'Please wait…' : pendingOtp ? 'Verify & Sign In' : 'Continue with OTP'}
          {!submitting && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="font-medium text-foreground hover:underline underline-offset-4">
          Create one free
        </Link>
      </p>
    </AuthLayout>
  )
}

export function RegisterPage() {
  const { login, completeOtp, pendingOtp } = useAuth()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (pendingOtp) {
        const profile = await completeOtp(phone, otp)
        navigate(getPostAuthPath(profile.role))
      } else {
        await login({
          phone,
          purpose: 'register',
          firstName,
          lastName,
          email: email || undefined,
        })
        toast.success('Verification code sent — check the API terminal')
      }
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout
      mode="register"
      title={pendingOtp ? 'Almost there' : 'Create your account'}
      subtitle={
        pendingOtp
          ? 'Verify your phone to activate your Elizade Connect profile.'
          : 'Join thousands of Toyota owners managing their vehicles digitally.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {!pendingOtp ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  placeholder="Divine"
                  className="h-11"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  placeholder="Obinali"
                  className="h-11"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-phone">Phone number</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reg-phone"
                  placeholder="0808 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="pl-10 h-12"
                  autoComplete="tel"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="you@email.com"
                  className="pl-10 h-12"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              By continuing, you agree to receive OTP messages and service notifications from Elizade Nigeria Limited.
            </p>
          </>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="reg-otp">Verification code</Label>
            <Input
              id="reg-otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="······"
              maxLength={6}
              className="text-center text-2xl tracking-[0.4em] font-mono h-14"
              required
            />
          </div>
        )}

        <Button type="submit" className="w-full h-12 text-base gap-2" disabled={submitting}>
          {submitting ? 'Please wait…' : pendingOtp ? 'Verify & Continue' : 'Send verification code'}
          {!submitting && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already registered?{' '}
        <Link to="/login" className="font-medium text-foreground hover:underline underline-offset-4">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
