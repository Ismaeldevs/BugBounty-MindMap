import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { UserPlus, Terminal, Mail, Lock, User, Shield, Zap, Key } from 'lucide-react';

const TURNSTILE_ENABLED = import.meta.env.VITE_TURNSTILE_ENABLED === 'true';
const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [displayText, setDisplayText] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const turnstileRef = useRef(null);
  const [turnstileToken, setTurnstileToken] = useState(null);

  useEffect(() => {
    const texts = ['NEW_USER_INIT', 'CREATE_PROFILE', 'REGISTER_NODE', 'SETUP_TERMINAL'];
    const typingSpeed = 100;
    const deletingSpeed = 50;
    const pauseTime = 2000;

    const typeEffect = () => {
      const currentFullText = texts[currentTextIndex];
      
      if (!isDeleting) {
        // Escribiendo
        if (displayText.length < currentFullText.length) {
          setDisplayText(currentFullText.substring(0, displayText.length + 1));
        } else {
          // Texto completo, esperar y luego borrar
          setTimeout(() => setIsDeleting(true), pauseTime);
          return;
        }
      } else {
        // Borrando
        if (displayText.length > 0) {
          setDisplayText(currentFullText.substring(0, displayText.length - 1));
        } else {
          // Texto borrado, cambiar al siguiente
          setIsDeleting(false);
          setCurrentTextIndex((currentTextIndex + 1) % texts.length);
          return;
        }
      }
    };

    const timeout = setTimeout(
      typeEffect,
      isDeleting ? deletingSpeed : typingSpeed
    );

    return () => clearTimeout(timeout);
  }, [displayText, isDeleting, currentTextIndex]);

  // Initialize Turnstile widget
  useEffect(() => {
    if (TURNSTILE_ENABLED && window.turnstile && turnstileRef.current) {
      window.turnstile.render(turnstileRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        callback: (token) => {
          setTurnstileToken(token);
        },
        'error-callback': () => {
          toast.error('✗ TURNSTILE VERIFICATION FAILED');
          setTurnstileToken(null);
        },
        theme: 'dark',
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.username || !formData.password || !formData.confirmPassword) {
      toast.error('⚠ ALL FIELDS REQUIRED');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('✗ PASSWORD MISMATCH');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('✗ PASSWORD TOO SHORT (MIN 8 CHARS)');
      return;
    }

    // Check Turnstile if enabled
    if (TURNSTILE_ENABLED && !turnstileToken) {
      toast.error('⚠ PLEASE COMPLETE SECURITY CHECK');
      return;
    }

    const result = await register({
      email: formData.email,
      username: formData.username,
      password: formData.password,
      turnstile_token: turnstileToken,
    });

    if (result.success) {
      toast.success('✓ ACCOUNT CREATED - CHECK EMAIL');
      // Redirect to verification page with email
      navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
    } else {
      // Check if it's a 409 error (already registered but not verified)
      if (result.error && result.error.includes('not verified')) {
        toast.success('✓ VERIFICATION CODE RESENT');
        // Redirect to verification page
        navigate(`/verify-email?email=${encodeURIComponent(formData.email)}`);
      } else {
        toast.error('✗ ' + (result.error || 'REGISTRATION FAILED'));
      }
      
      // Reset Turnstile on error
      if (TURNSTILE_ENABLED && window.turnstile) {
        window.turnstile.reset();
        setTurnstileToken(null);
      }
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

      <div className="max-w-2xl w-full relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6 relative">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--color-cyber-green)] blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-[var(--color-cyber-darker)] p-4 border-2 border-[var(--color-cyber-green)]" style={{
                clipPath: 'polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)'
              }}>
                <UserPlus className="w-12 h-12 text-[var(--color-cyber-green)]" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-2 font-[Orbitron] tracking-wider" style={{ color: 'var(--color-cyber-green)' }}>
            <span className="inline-block min-w-[400px] text-left">
              {displayText}
              <span className="animate-pulse">|</span>
            </span>
          </h1>
          
          <div className="flex items-center justify-center gap-2 text-[var(--color-cyber-blue)] mb-2">
            <Shield className="w-4 h-4" />
            <p className="font-mono text-sm tracking-wider">SECURE REGISTRATION PROTOCOL</p>
            <Shield className="w-4 h-4" />
          </div>
          
          <p className="text-[var(--color-cyber-green)] opacity-70 font-mono text-xs tracking-widest">
            [ ACCOUNT_CREATION_MODULE ]
          </p>
        </div>

        {/* Register Form */}
        <div className="card-cyber scan-lines">
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--color-cyber-red)] animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-[var(--color-cyber-yellow)]"></div>
            <div className="w-3 h-3 rounded-full bg-[var(--color-cyber-green)]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5 mt-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-cyber-darker)] border border-[var(--color-cyber-green)] text-[var(--color-cyber-green)] font-mono text-sm">
                <Zap className="w-4 h-4" />
                <span>NEW_NODE_REGISTRATION</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-mono text-[var(--color-cyber-green)] mb-2 tracking-wider">
                  &gt; EMAIL_ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-[var(--color-cyber-blue)]" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="user@domain.com"
                    className="input-cyber pl-12"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Username Input */}
              <div>
                <label htmlFor="username" className="block text-sm font-mono text-[var(--color-cyber-green)] mb-2 tracking-wider">
                  &gt; USERNAME
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-[var(--color-cyber-blue)]" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="hacker_name"
                    className="input-cyber pl-12"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-mono text-[var(--color-cyber-green)] mb-2 tracking-wider">
                  &gt; PASSWORD_KEY
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-[var(--color-cyber-blue)]" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input-cyber pl-12"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Confirm Password Input */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-mono text-[var(--color-cyber-green)] mb-2 tracking-wider">
                  &gt; CONFIRM_KEY
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-[var(--color-cyber-blue)]" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="input-cyber pl-12"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password Requirements */}
            <div className="bg-[var(--color-cyber-darker)] border border-[var(--color-cyber-blue)] border-opacity-30 p-4">
              <p className="text-xs font-mono text-[var(--color-cyber-blue)] mb-2 tracking-wider">
                &gt; PASSWORD_REQUIREMENTS:
              </p>
              <ul className="text-xs font-mono text-[var(--color-cyber-blue)] opacity-70 space-y-1 pl-4">
                <li>• MIN_LENGTH: 8 characters</li>
                <li>• MUST_CONTAIN: [A-Z] uppercase</li>
                <li>• MUST_CONTAIN: [a-z] lowercase</li>
                <li>• MUST_CONTAIN: [0-9] digit</li>
              </ul>
            </div>

            {/* Cloudflare Turnstile */}
            {TURNSTILE_ENABLED && (
              <div className="flex justify-center">
                <div 
                  ref={turnstileRef}
                  className="turnstile-widget"
                ></div>
              </div>
            )}

            {/* Register Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-cyber-green w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[var(--color-cyber-green)] border-t-transparent rounded-full animate-spin"></div>
                  <span>CREATING_ACCOUNT...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" />
                  <span>CREATE_ACCOUNT</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-cyber-green)] opacity-30"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-[var(--color-cyber-dark)] text-[var(--color-cyber-green)] font-mono tracking-widest">
                  OR
                </span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-[var(--color-cyber-blue)] opacity-70 font-mono text-sm mb-3">
                &gt; EXISTING_USER_DETECTED
              </p>
              <Link
                to="/login"
                className="btn-cyber inline-flex items-center justify-center gap-2 px-6 py-2"
              >
                <Terminal className="w-4 h-4" />
                <span>ACCESS_TERMINAL</span>
              </Link>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-[var(--color-cyber-darker)] border border-[var(--color-cyber-green)] border-opacity-20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--color-cyber-green)] animate-pulse"></div>
              <span className="text-[var(--color-cyber-green)] font-mono text-xs tracking-wider">REGISTRATION_ACTIVE</span>
            </div>
            <div className="w-px h-4 bg-[var(--color-cyber-green)] opacity-30"></div>
            <span className="text-[var(--color-cyber-blue)] opacity-50 font-mono text-xs tracking-wider">
              v2.0.CYBER
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
