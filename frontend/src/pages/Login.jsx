import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { LogIn, Terminal, Mail, Lock, Shield, Zap } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const [displayText, setDisplayText] = useState('');
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const texts = ['ACCESS_TERMINAL', 'INIT_SESSION', 'AUTH_REQUIRED', 'CONNECT_NODE'];
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('⚠ ALL FIELDS REQUIRED');
      return;
    }

    const result = await login({ email, password });

    if (result.success) {
      toast.success('✓ ACCESS GRANTED');
      navigate('/dashboard');
    } else {
      // Check if error is about email not verified
      if (result.error && result.error.includes('not verified')) {
        toast.error('⚠ EMAIL NOT VERIFIED');
        // Redirect to verification page after a brief delay
        setTimeout(() => {
          navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        }, 1500);
      } else {
        toast.error('✗ ' + (result.error || 'AUTHENTICATION FAILED'));
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Static Background Grid */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(0, 217, 255, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 217, 255, 0.1) 1px, transparent 1px),
            linear-gradient(rgba(184, 0, 230, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(184, 0, 230, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: '100px 100px, 100px 100px, 20px 20px, 20px 20px'
        }}></div>
      </div>

      {/* Corner Decorations */}
      <div className="absolute top-0 left-0 w-32 h-32 border-l-2 border-t-2 border-[var(--color-cyber-blue)]"></div>
      <div className="absolute top-0 right-0 w-32 h-32 border-r-2 border-t-2 border-[var(--color-cyber-purple)]"></div>
      <div className="absolute bottom-0 left-0 w-32 h-32 border-l-2 border-b-2 border-[var(--color-cyber-green)]"></div>
      <div className="absolute bottom-0 right-0 w-32 h-32 border-r-2 border-b-2 border-[var(--color-cyber-pink)]"></div>

      <div className="max-w-md w-full relative z-10">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-6 relative">
            <div className="relative">
              <div className="absolute inset-0 bg-[var(--color-cyber-blue)] blur-xl opacity-50 animate-pulse"></div>
              <div className="relative bg-[var(--color-cyber-darker)] p-4 border-2 border-[var(--color-cyber-blue)]" style={{
                clipPath: 'polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)'
              }}>
                <Terminal className="w-12 h-12 text-[var(--color-cyber-blue)]" />
              </div>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-2 font-[Orbitron] tracking-wider" style={{ color: 'var(--color-cyber-blue)' }}>
            <span className="inline-block min-w-[400px] text-left">
              {displayText}
              <span className="animate-pulse">|</span>
            </span>
          </h1>
          
          <div className="flex items-center justify-center gap-2 text-[var(--color-cyber-green)] mb-2">
            <Shield className="w-4 h-4" />
            <p className="font-mono text-sm tracking-wider">SECURE CONNECTION ESTABLISHED</p>
            <Shield className="w-4 h-4" />
          </div>
          
          <p className="text-[var(--color-cyber-blue)] opacity-70 font-mono text-xs tracking-widest">
            [ BUG_BOUNTY_MINDMAP_v2.0 ]
          </p>
        </div>

        {/* Login Form */}
        <div className="card-cyber scan-lines">
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--color-cyber-red)] animate-pulse"></div>
            <div className="w-3 h-3 rounded-full bg-[var(--color-cyber-yellow)]"></div>
            <div className="w-3 h-3 rounded-full bg-[var(--color-cyber-green)]"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-cyber-darker)] border border-[var(--color-cyber-blue)] text-[var(--color-cyber-blue)] font-mono text-sm">
                <Zap className="w-4 h-4" />
                <span>AUTHENTICATION_REQUIRED</span>
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-mono text-[var(--color-cyber-green)] mb-2 tracking-wider">
                &gt; EMAIL_ADDRESS
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-[var(--color-cyber-blue)]" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@domain.com"
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
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-cyber pl-12"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="btn-cyber w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-[var(--color-cyber-blue)] border-t-transparent rounded-full animate-spin"></div>
                  <span>AUTHENTICATING...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>INITIATE_SESSION</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--color-cyber-blue)] opacity-30"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-[var(--color-cyber-dark)] text-[var(--color-cyber-blue)] font-mono tracking-widest">
                  OR
                </span>
              </div>
            </div>

            {/* Register Link */}
            <div className="text-center">
              <p className="text-[var(--color-cyber-blue)] opacity-70 font-mono text-sm mb-3">
                &gt; NEW_USER_DETECTED
              </p>
              <Link
                to="/register"
                className="btn-cyber-green inline-flex items-center justify-center gap-2 px-6 py-2"
              >
                <Terminal className="w-4 h-4" />
                <span>CREATE_ACCOUNT</span>
              </Link>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-[var(--color-cyber-darker)] border border-[var(--color-cyber-blue)] border-opacity-20">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[var(--color-cyber-green)] animate-pulse"></div>
              <span className="text-[var(--color-cyber-green)] font-mono text-xs tracking-wider">SYSTEM_ONLINE</span>
            </div>
            <div className="w-px h-4 bg-[var(--color-cyber-blue)] opacity-30"></div>
            <span className="text-[var(--color-cyber-blue)] opacity-50 font-mono text-xs tracking-wider">
              v2.0.CYBER
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
