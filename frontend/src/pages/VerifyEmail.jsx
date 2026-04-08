import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Mail, ShieldCheck, RefreshCw, ArrowLeft, Check } from 'lucide-react';
import { authAPI } from '../services/api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [canResend, setCanResend] = useState(true);
  const [countdown, setCountdown] = useState(0);

  // Countdown timer for resend button
  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else {
      setCanResend(true);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleCodeChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    
    // Check if pasted data is 6 digits
    if (/^\d{6}$/.test(pastedData)) {
      const newCode = pastedData.split('');
      setCode(newCode);
      // Focus last input
      const lastInput = document.getElementById('code-5');
      if (lastInput) lastInput.focus();
    }
  };

  const handleVerify = async () => {
    const verificationCode = code.join('');
    
    if (verificationCode.length !== 6) {
      toast.error('✗ ENTER COMPLETE CODE');
      return;
    }

    setIsVerifying(true);

    try {
      await authAPI.verifyEmail(email, verificationCode);
      toast.success('✓ EMAIL VERIFIED');
      
      // Wait a moment then redirect to login
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Verification failed';
      toast.error('✗ ' + errorMsg.toUpperCase());
      // Clear code on error
      setCode(['', '', '', '', '', '']);
      document.getElementById('code-0')?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!canResend) return;

    setIsResending(true);

    try {
      await authAPI.resendVerificationCode(email);
      toast.success('✓ CODE SENT - CHECK EMAIL');
      
      // Start 60 second countdown
      setCanResend(false);
      setCountdown(60);
      
      // Clear current code
      setCode(['', '', '', '', '', '']);
      document.getElementById('code-0')?.focus();
    } catch (error) {
      const errorMsg = error.response?.data?.detail || 'Failed to resend code';
      toast.error('✗ ' + errorMsg.toUpperCase());
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 255, 65, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 65, 0.1) 1px, transparent 1px),
            linear-gradient(rgba(255, 0, 229, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 0, 229, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px',
          animation: 'scan 20s linear infinite'
        }}></div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[var(--color-cyber-green)]"></div>
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-[var(--color-cyber-pink)]"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-[var(--color-cyber-purple)]"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[var(--color-cyber-blue)]"></div>

      <div className="max-w-lg w-full relative z-10">
        {/* Back Button */}
        <button
          onClick={() => navigate('/register')}
          className="mb-6 flex items-center gap-2 text-[var(--color-cyber-blue)] hover:text-[var(--color-cyber-green)] transition-colors font-mono text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>BACK_TO_REGISTER</span>
        </button>

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6 relative">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--color-cyber-green)] blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-[var(--color-cyber-darker)] p-4 border-2 border-[var(--color-cyber-green)]" style={{
                clipPath: 'polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)'
              }}>
                <Mail className="w-12 h-12 text-[var(--color-cyber-green)]" />
              </div>
            </div>
          </div>
          
          <h1 className="text-3xl font-bold mb-2 font-[Orbitron] tracking-wider text-[var(--color-cyber-green)]">
            EMAIL VERIFICATION
          </h1>
          
          <div className="flex items-center justify-center gap-2 text-[var(--color-cyber-blue)] mb-2">
            <ShieldCheck className="w-4 h-4" />
            <p className="font-mono text-sm tracking-wider">SECURITY PROTOCOL ACTIVE</p>
            <ShieldCheck className="w-4 h-4" />
          </div>
          
          <p className="text-[var(--color-cyber-green)] opacity-70 font-mono text-xs tracking-widest">
            [ IDENTITY_VERIFICATION_MODULE ]
          </p>
        </div>

        {/* Verification Form */}
        <div className="card-cyber scan-lines">
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--color-cyber-red)] animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-[var(--color-cyber-yellow)]"></div>
            <div className="w-3 h-3 rounded-full bg-[var(--color-cyber-green)]"></div>
          </div>

          <div className="mt-8 space-y-6">
            {/* Instructions */}
            <div className="bg-[var(--color-cyber-darker)] border border-[var(--color-cyber-blue)] border-opacity-30 p-4">
              <p className="text-sm font-mono text-[var(--color-cyber-blue)] mb-2">
                &gt; VERIFICATION_CODE_SENT_TO:
              </p>
              <p className="text-sm font-mono text-[var(--color-cyber-green)] font-bold break-all">
                {email}
              </p>
              <p className="text-xs font-mono text-[var(--color-cyber-blue)] opacity-70 mt-2">
                Enter the 6-digit code from your email
              </p>
              <p className="text-xs font-mono text-[var(--color-cyber-red)] opacity-70 mt-1">
                Code expires in 10 minutes
              </p>
            </div>

            {/* Code Input */}
            <div>
              <label className="block text-sm font-mono text-[var(--color-cyber-green)] mb-3 tracking-wider text-center">
                &gt; ENTER_VERIFICATION_CODE
              </label>
              <div className="flex justify-center gap-2">
                {code.map((digit, index) => (
                  <input
                    key={index}
                    id={`code-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    onPaste={index === 0 ? handlePaste : undefined}
                    className="w-12 h-14 text-center text-2xl font-mono font-bold bg-[var(--color-cyber-darker)] border-2 border-[var(--color-cyber-green)] text-[var(--color-cyber-green)] focus:border-[var(--color-cyber-blue)] focus:ring-2 focus:ring-[var(--color-cyber-blue)] focus:ring-opacity-50 transition-all"
                    style={{
                      clipPath: 'polygon(10% 0%, 90% 0%, 100% 10%, 100% 90%, 90% 100%, 10% 100%, 0% 90%, 0% 10%)'
                    }}
                    disabled={isVerifying}
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerify}
              disabled={isVerifying || code.join('').length !== 6}
              className="btn-cyber-green w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? (
                <>
                  <div className="w-5 h-5 border-2 border-[var(--color-cyber-green)] border-t-transparent rounded-full animate-spin"></div>
                  <span>VERIFYING...</span>
                </>
              ) : (
                <>
                  <Check className="w-5 h-5" />
                  <span>VERIFY_EMAIL</span>
                </>
              )}
            </button>

            {/* Resend Code */}
            <div className="text-center pt-4 border-t border-[var(--color-cyber-green)] border-opacity-20">
              <p className="text-[var(--color-cyber-blue)] opacity-70 font-mono text-sm mb-3">
                &gt; CODE_NOT_RECEIVED?
              </p>
              <button
                onClick={handleResendCode}
                disabled={!canResend || isResending}
                className="btn-cyber inline-flex items-center justify-center gap-2 px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-[var(--color-cyber-blue)] border-t-transparent rounded-full animate-spin"></div>
                    <span>SENDING...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    <span>
                      {countdown > 0 ? `RESEND_IN_${countdown}s` : 'RESEND_CODE'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-[var(--color-cyber-darker)] border border-[var(--color-cyber-green)] border-opacity-20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--color-cyber-green)] animate-pulse"></div>
              <span className="text-[var(--color-cyber-green)] font-mono text-xs tracking-wider">VERIFICATION_ACTIVE</span>
            </div>
            <div className="w-px h-4 bg-[var(--color-cyber-green)] opacity-30"></div>
            <span className="text-[var(--color-cyber-blue)] opacity-50 font-mono text-xs tracking-wider">
              SECURE_CHANNEL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
