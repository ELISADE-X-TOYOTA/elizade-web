import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Phone, Mail, ArrowRight, User } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { ApiError } from '@/lib/api'
import { getPostAuthPath } from '@/lib/auth-utils'
import { AuthLayout } from '@/components/layout/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OtpInput } from '@/components/ui/otp-input'

const OTP_LENGTH = 6

function ResendRow({ onResend, resending }: { onResend: () => void; resending: boolean }) {
  return (
    <div className="flex items-center justify-center gap-1.5 pt-1 text-xs text-muted-foreground">
      <span>Didn&apos;t receive a code?</span>
      <button
        type="button"
        onClick={onResend}
        disabled={resending}
        className="font-medium text-foreground underline-offset-4 hover:underline disabled:opacity-50"
      >
        {resending ? 'Sending…' : 'Resend code'}
      </button>
    </div>
  )
}

export function LoginPage() {
  const { login, completeOtp, resetOtp, pendingOtp } = useAuth()
  const navigate = useNavigate()
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const busy = useRef(false)

  const verify = async (code: string) => {
    if (busy.current) return
    busy.current = true
    setSubmitting(true)
    try {
      const profile = await completeOtp(phone, code)
      toast.success('Welcome back')
      navigate(getPostAuthPath(profile.role))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong')
      setOtp('')
    } finally {
      busy.current = false
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pendingOtp) {
      if (otp.length === OTP_LENGTH) await verify(otp)
      return
    }
    setSubmitting(true)
    try {
      await login({ phone, purpose: 'login' })
      toast.success('Verification code sent to your phone')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await login({ phone, purpose: 'login' })
      setOtp('')
      toast.success('A new code is on its way')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not resend code')
    } finally {
      setResending(false)
    }
  }

  const changeNumber = () => {
    resetOtp()
    setOtp('')
  }

  return (
    <AuthLayout
      mode="login"
      title={pendingOtp ? 'Enter your code' : 'Welcome back'}
      subtitle={
        pendingOtp
          ? `We sent a 6-digit code to ${phone || 'your phone'}. Enter it below to continue.`
          : 'Sign in with your mobile number — no password required.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {!pendingOtp ? (
          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <div className="relative">
              <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="h-12 pl-10"
                placeholder="0810 789 1549"
                autoComplete="tel"
                inputMode="tel"
                required
              />
            </div>
            <p className="text-xs text-muted-foreground">
              We&apos;ll text you a one-time code to confirm it&apos;s really you.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Verification code</Label>
              <button
                type="button"
                onClick={changeNumber}
                className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Change number
              </button>
            </div>
            <OtpInput value={otp} onChange={setOtp} onComplete={verify} disabled={submitting} />
            <ResendRow onResend={handleResend} resending={resending} />
          </div>
        )}

        <Button
          type="submit"
          className="h-12 w-full gap-2 text-base"
          disabled={submitting || (pendingOtp && otp.length < OTP_LENGTH)}
        >
          {submitting ? 'Please wait…' : pendingOtp ? 'Verify & sign in' : 'Continue'}
          {!submitting && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        New to Elizade Connect?{' '}
        <Link to="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  )
}

export function RegisterPage() {
  const { login, completeOtp, resetOtp, pendingOtp } = useAuth()
  const navigate = useNavigate()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const busy = useRef(false)

  const requestCode = () =>
    login({ phone, purpose: 'register', firstName, lastName, email: email || undefined })

  const verify = async (code: string) => {
    if (busy.current) return
    busy.current = true
    setSubmitting(true)
    try {
      const profile = await completeOtp(phone, code)
      toast.success('Account created — welcome to Elizade Connect')
      navigate(getPostAuthPath(profile.role))
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong')
      setOtp('')
    } finally {
      busy.current = false
      setSubmitting(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (pendingOtp) {
      if (otp.length === OTP_LENGTH) await verify(otp)
      return
    }
    setSubmitting(true)
    try {
      await requestCode()
      toast.success('Verification code sent to your phone')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await requestCode()
      setOtp('')
      toast.success('A new code is on its way')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not resend code')
    } finally {
      setResending(false)
    }
  }

  const changeDetails = () => {
    resetOtp()
    setOtp('')
  }

  return (
    <AuthLayout
      mode="register"
      title={pendingOtp ? 'Verify your number' : 'Create your account'}
      subtitle={
        pendingOtp
          ? `We sent a 6-digit code to ${phone || 'your phone'}. Enter it to activate your account.`
          : 'Join thousands of Toyota owners managing their vehicles digitally.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {!pendingOtp ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="firstName"
                    placeholder="Divine"
                    className="h-12 pl-10"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    autoComplete="given-name"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  placeholder="Obinali"
                  className="h-12"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-phone">Phone number</Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reg-phone"
                  placeholder="0808 000 0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-12 pl-10"
                  autoComplete="tel"
                  inputMode="tel"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-email">
                Email <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="reg-email"
                  type="email"
                  placeholder="you@email.com"
                  className="h-12 pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>
            <p className="text-xs leading-relaxed text-muted-foreground">
              By continuing, you agree to receive service notifications and one-time codes from Elizade
              Nigeria Limited.
            </p>
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Verification code</Label>
              <button
                type="button"
                onClick={changeDetails}
                className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Edit details
              </button>
            </div>
            <OtpInput value={otp} onChange={setOtp} onComplete={verify} disabled={submitting} />
            <ResendRow onResend={handleResend} resending={resending} />
          </div>
        )}

        <Button
          type="submit"
          className="h-12 w-full gap-2 text-base"
          disabled={submitting || (pendingOtp && otp.length < OTP_LENGTH)}
        >
          {submitting ? 'Please wait…' : pendingOtp ? 'Verify & continue' : 'Create account'}
          {!submitting && <ArrowRight className="h-4 w-4" />}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </AuthLayout>
  )
}
