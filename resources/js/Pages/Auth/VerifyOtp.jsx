import { useState, useRef, useEffect } from 'react'
import { router, Link } from '@inertiajs/react'
import { AuthShell } from './AuthShell'

export default function VerifyOtp({ email }) {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [errors, setErrors] = useState({})
  const [processing, setProcessing] = useState(false)
  const [resendStatus, setResendStatus] = useState('')
  const inputRefs = useRef([])

  useEffect(() => {
    inputRefs.current[0]?.focus()
  }, [])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)
    setErrors({})

    // Auto-advance
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }

    // Auto-submit when all 6 digits entered
    if (newCode.every(d => d !== '')) {
      submitCode(newCode.join(''))
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted) {
      const newCode = pasted.split('').concat(Array(6).fill('')).slice(0, 6)
      setCode(newCode)
      const nextEmpty = newCode.findIndex(d => d === '')
      inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus()
      if (pasted.length === 6) {
        submitCode(pasted)
      }
    }
  }

  const submitCode = (otp) => {
    setProcessing(true)
    router.post('/register/verify-otp', { email, code: otp }, {
      onError: (err) => {
        setErrors(err)
        setCode(['', '', '', '', '', ''])
        inputRefs.current[0]?.focus()
      },
      onFinish: () => setProcessing(false),
    })
  }

  const handleResend = () => {
    setResendStatus('sending')
    router.post('/register/resend-otp', { email }, {
      onSuccess: () => setResendStatus('sent'),
      onError: () => setResendStatus('error'),
    })
  }

  return (
    <AuthShell
      title="Verify your email"
      subtitle={`We sent a 6-digit code to ${email}`}
      footer={
        <div className="flex flex-col items-center gap-3">
          <button
            onClick={handleResend}
            disabled={resendStatus === 'sending'}
            className="text-sm font-semibold text-primary hover:underline disabled:opacity-50"
          >
            {resendStatus === 'sending' ? 'Sending...' : resendStatus === 'sent' ? 'Code sent!' : 'Resend code'}
          </button>
          <Link href="/register" className="text-xs text-textmuted hover:text-primary hover:underline">Back to registration</Link>
        </div>
      }
    >
      <form onSubmit={(e) => { e.preventDefault(); submitCode(code.join('')) }} className="space-y-6">
        {/* OTP Input */}
        <div className="flex justify-center gap-2.5">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              disabled={processing}
              className={`h-14 w-12 rounded-xl border bg-white text-center text-xl font-bold text-textprimary outline-none transition ${
                errors.code ? 'border-danger' : 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20'
              } ${processing ? 'opacity-50' : ''}`}
            />
          ))}
        </div>

        {errors.code && (
          <p className="text-center text-sm font-medium text-danger">{errors.code}</p>
        )}

        <button type="submit" disabled={processing || code.some(d => d === '')}
          className="h-12 w-full rounded-lg bg-primary font-medium text-white shadow-md shadow-[#0040E7]/25 transition hover:bg-primary/90 disabled:opacity-60">
          {processing ? 'Verifying...' : 'Verify'}
        </button>
      </form>
    </AuthShell>
  )
}
