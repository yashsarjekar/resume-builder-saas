'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';

export default function Header() {
  const router = useRouter();
  const { user, isAuthenticated, logout, checkAuth } = useAuthStore();
  const [showToolsDropdown, setShowToolsDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [announcementVisible, setAnnouncementVisible] = useState(true);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => { logout(); router.push('/'); };
  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      {/* Announcement bar */}
      {announcementVisible && (
        <div className="relative z-50 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 animated-gradient-bg text-white text-xs sm:text-sm font-medium py-2 px-4 text-center">
          <span>⚡ ATS Match is live — check your resume score against any job in seconds</span>
          <Link href="/jobs" className="ml-2 underline underline-offset-2 hover:text-indigo-200">Try it free →</Link>
          <button
            onClick={() => setAnnouncementVisible(false)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-[#050816]/90 backdrop-blur-xl border-b border-white/10 shadow-lg shadow-black/20'
            : 'bg-[#050816]/70 backdrop-blur-md border-b border-white/5'
        }`}
      >
        <div className="container mx-auto px-4 py-3.5">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-8 h-8">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg opacity-80 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-lg blur-sm opacity-50 group-hover:opacity-80 transition-opacity" />
                <div className="relative w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-black text-sm">R</span>
                </div>
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Resume Builder <span className="text-indigo-400">AI</span></span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-7">
              {[
                { href: '/#features', label: 'Features' },
                { href: '/jobs', label: 'Jobs' },
                { href: '/blog', label: 'Blog' },
                { href: '/pricing', label: 'Pricing' },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-gray-400 hover:text-white text-sm font-medium transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ))}
              {isAuthenticated && (
                <>
                  <Link href="/dashboard" className="text-gray-400 hover:text-white text-sm font-medium transition-colors">
                    Dashboard
                  </Link>
                  <div className="relative">
                    <button
                      onClick={() => setShowToolsDropdown(!showToolsDropdown)}
                      onBlur={() => setTimeout(() => setShowToolsDropdown(false), 150)}
                      className="text-gray-400 hover:text-white text-sm font-medium transition-colors flex items-center gap-1"
                    >
                      AI Tools
                      <svg className={`w-3.5 h-3.5 transition-transform ${showToolsDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {showToolsDropdown && (
                      <div className="absolute top-full right-0 mt-2 w-52 glass rounded-xl shadow-2xl shadow-black/40 py-1 overflow-hidden">
                        {[
                          { href: '/tools/keywords', label: '🔍 Keyword Extractor' },
                          { href: '/tools/cover-letter', label: '✉️ Cover Letter' },
                          { href: '/tools/linkedin', label: '💼 LinkedIn Optimizer' },
                        ].map((t) => (
                          <Link key={t.href} href={t.href} onClick={() => setShowToolsDropdown(false)}
                            className="block px-4 py-2.5 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors">
                            {t.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </nav>

            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                      {user?.email?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <span className="text-xs text-gray-300 max-w-[120px] truncate">{user?.email}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 capitalize">{user?.subscription_type}</span>
                  </div>
                  <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-white transition-colors">
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-3 py-2">
                    Login
                  </Link>
                  <Link href="/signup" className="btn-primary text-sm px-5 py-2.5 rounded-xl">
                    Get Started Free
                  </Link>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pt-4 pb-3 border-t border-white/10 mt-3 space-y-0.5">
              {[
                { href: '/#features', label: 'Features' },
                { href: '/jobs', label: 'Jobs' },
                { href: '/blog', label: 'Blog' },
                { href: '/pricing', label: 'Pricing' },
              ].map((item) => (
                <Link key={item.href} href={item.href} onClick={closeMobileMenu}
                  className="block px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 text-sm transition-colors">
                  {item.label}
                </Link>
              ))}
              {isAuthenticated && (
                <>
                  <Link href="/dashboard" onClick={closeMobileMenu} className="block px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 text-sm transition-colors">Dashboard</Link>
                  <Link href="/tools/keywords" onClick={closeMobileMenu} className="block px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 text-sm transition-colors">🔍 Keyword Extractor</Link>
                  <Link href="/tools/cover-letter" onClick={closeMobileMenu} className="block px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 text-sm transition-colors">✉️ Cover Letter</Link>
                  <Link href="/tools/linkedin" onClick={closeMobileMenu} className="block px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 text-sm transition-colors">💼 LinkedIn Optimizer</Link>
                </>
              )}
              <div className="pt-3 border-t border-white/10 space-y-2 mt-2">
                {isAuthenticated ? (
                  <>
                    <p className="px-3 text-xs text-gray-500">{user?.email}</p>
                    <button onClick={() => { handleLogout(); closeMobileMenu(); }} className="w-full text-left px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 text-sm transition-colors">Logout</button>
                  </>
                ) : (
                  <>
                    <Link href="/login" onClick={closeMobileMenu} className="block px-3 py-2.5 rounded-lg text-gray-300 hover:text-white hover:bg-white/5 text-sm transition-colors">Login</Link>
                    <Link href="/signup" onClick={closeMobileMenu} className="block mx-3 py-2.5 text-center btn-primary rounded-xl text-sm">Get Started Free</Link>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
