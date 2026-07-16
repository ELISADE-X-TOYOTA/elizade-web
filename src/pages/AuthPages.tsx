import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Mail, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { ApiError } from '@/lib/api'
import { canAccessAdminPortal, getPostAuthPath } from '@/lib/auth-utils'
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
  const { login, completeOtp, resetOtp, pendingOtp, logout } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [resending, setResending] = useState(false)
  const busy = useRef(false)

  const verify = async (code: string) => {
    if (busy.current) return
    busy.current = true
    setSubmitting(true)
    try {
      const profile = await completeOtp(email, code)
      if (!canAccessAdminPortal(profile.role)) {
        logout()
        toast.error('This portal is for staff and admin accounts only.')
        resetOtp()
        setOtp('')
        return
      }
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
      await login({ email, purpose: 'login' })
      toast.success('Verification code sent to your email')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Something went wrong')
    } finally {
      setSubmitting(false)
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      await login({ email, purpose: 'login' })
      setOtp('')
      toast.success('A new code is on its way')
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Could not resend code')
    } finally {
      setResending(false)
    }
  }

  const changeEmail = () => {
    resetOtp()
    setOtp('')
  }

  return (
    <AuthLayout
      title={pendingOtp ? 'Enter your code' : 'Staff sign in'}
      subtitle={
        pendingOtp
          ? `We sent a 6-digit code to ${email || 'your email'}. Enter it below to continue.`
          : 'Sign in with your work email address to access the admin portal.'
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {!pendingOtp ? (
          <div className="space-y-2">
            <Label htmlFor="email">Work email</Label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 pl-10"
                placeholder="you@elizade.com"
                autoComplete="email"
                inputMode="email"
                required
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Verification code</Label>
              <button
                type="button"
                onClick={changeEmail}
                className="text-xs font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
              >
                Change email
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
    </AuthLayout>
  )
}
