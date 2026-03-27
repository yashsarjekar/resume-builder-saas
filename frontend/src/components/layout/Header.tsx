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

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">R</span>
            </div>
            <span className="text-xl font-bold text-gray-900">Resume Builder</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className="text-gray-600 hover:text-gray-900">
              Features
            </Link>
            <Link href="/jobs" className="text-gray-600 hover:text-gray-900">
              Jobs
            </Link>
            <Link href="/blog" className="text-gray-600 hover:text-gray-900">
              Blog
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-gray-900">
              Pricing
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
                  Dashboard
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setShowToolsDropdown(!showToolsDropdown)}
                    className="text-gray-600 hover:text-gray-900 flex items-center"
                  >
                    AI Tools
                    <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showToolsDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg border border-gray-200 py-1 z-50">
                      <Link
                        href="/tools/keywords"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowToolsDropdown(false)}
                      >
                        Keyword Extractor
                      </Link>
                      <Link
                        href="/tools/cover-letter"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowToolsDropdown(false)}
                      >
                        Cover Letter Generator
                      </Link>
                      <Link
                        href="/tools/linkedin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowToolsDropdown(false)}
                      >
                        LinkedIn Optimizer
                      </Link>
                    </div>
                  )}
                </div>
              </>
            )}
          </nav>

          {/* Desktop auth buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">
                  {user?.email}
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {user?.subscription_type}
                </span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile: hamburger */}
          <button
            className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-gray-100 mt-4 space-y-1">
            <Link href="/#features" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
              Features
            </Link>
            <Link href="/jobs" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
              Jobs
            </Link>
            <Link href="/blog" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
              Blog
            </Link>
            <Link href="/pricing" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
              Pricing
            </Link>
            {isAuthenticated && (
              <>
                <Link href="/dashboard" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                  Dashboard
                </Link>
                <Link href="/tools/keywords" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                  Keyword Extractor
                </Link>
                <Link href="/tools/cover-letter" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                  Cover Letter Generator
                </Link>
                <Link href="/tools/linkedin" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                  LinkedIn Optimizer
                </Link>
              </>
            )}
            <div className="pt-2 border-t border-gray-100 space-y-1">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-500">{user?.email}</div>
                  <button
                    onClick={() => { handleLogout(); closeMobileMenu(); }}
                    className="w-full text-left px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                    Login
                  </Link>
                  <Link href="/signup" onClick={closeMobileMenu} className="block px-3 py-2 rounded-md text-center font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
