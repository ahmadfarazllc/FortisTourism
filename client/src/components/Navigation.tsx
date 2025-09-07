import { Link, useLocation } from 'wouter'
import { User, Menu, X, LogOut } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './auth/AuthModal'

export default function Navigation() {
  const [location] = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const { user, signOut, isAdmin } = useAuth()

  const navItems = [
    { href: '/', label: 'Explore' },
    { href: '/destinations', label: 'Destinations' },
    { href: '/community', label: 'Community' },
    ...(user ? [{ href: '/dashboard', label: 'Dashboard' }] : []),
    ...(isAdmin ? [{ href: '/admin', label: 'Admin' }] : []),
  ]

  const handleSignOut = async () => {
    await signOut()
  }

  const openAuthModal = (mode: 'signin' | 'signup') => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
            <div className="text-2xl font-bold holographic">
              FORTIS
            </div>
            <div className="text-xs uppercase tracking-wider text-neon-blue">
              TOURISM
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-all duration-300 hover:text-neon-blue ${
                  location === item.href
                    ? 'text-neon-blue'
                    : 'text-white/80'
                }`}
                data-testid={`link-${item.label.toLowerCase()}`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* User Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-white/80 text-sm">
                  Welcome, {user.user_metadata?.firstName || user.email}
                </span>
                <button 
                  onClick={handleSignOut}
                  className="glass rounded-full p-2 hover:neon-blue transition-all duration-300"
                  data-testid="button-sign-out"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => openAuthModal('signin')}
                  className="px-4 py-2 text-white/80 hover:text-neon-blue transition-colors"
                  data-testid="button-sign-in"
                >
                  Sign In
                </button>
                <button
                  onClick={() => openAuthModal('signup')}
                  className="px-4 py-2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg hover:shadow-lg transition-all duration-300"
                  data-testid="button-sign-up"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="glass rounded-lg p-2 hover:neon-blue transition-all duration-300"
              data-testid="button-mobile-menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`text-sm font-medium transition-all duration-300 hover:text-neon-blue px-4 py-2 rounded-lg ${
                    location === item.href
                      ? 'text-neon-blue bg-white/5'
                      : 'text-white/80'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                  data-testid={`link-mobile-${item.label.toLowerCase()}`}
                >
                  {item.label}
                </Link>
              ))}
              {user ? (
                <button 
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white/80 hover:text-neon-blue transition-all duration-300"
                  data-testid="button-mobile-sign-out"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => openAuthModal('signin')}
                    className="w-full text-left px-4 py-2 text-sm font-medium text-white/80 hover:text-neon-blue transition-all duration-300"
                    data-testid="button-mobile-sign-in"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuthModal('signup')}
                    className="w-full text-left px-4 py-2 text-sm font-medium text-white/80 hover:text-neon-blue transition-all duration-300"
                    data-testid="button-mobile-sign-up"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      </nav>
      
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialMode={authMode}
      />
    </>
  )
}