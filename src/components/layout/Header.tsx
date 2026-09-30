import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Search, Bookmark, Sun, Moon, Monitor,
  Globe, Menu, X, Film, ChevronDown
} from 'lucide-react'
import { SearchBar } from '@/components/search/SearchBar'
import { usePreferences } from '@/hooks/usePreferences'
import type { Market } from '@/types'

interface HeaderProps {
  markets: Market[]
}

const MARKET_FLAGS: Record<string, string> = {
  IN: '🇮🇳', US: '🇺🇸', GB: '🇬🇧', JP: '🇯🇵', KR: '🇰🇷', AU: '🇦🇺',
}

const NAV_LINKS = [
  { label: 'Discover', href: '/discover' },
  { label: 'Movies', href: '/search?type=movie' },
  { label: 'Providers', href: '/providers' },
  { label: 'Developers', href: '/developers' },
]

export function Header({ markets }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [marketOpen, setMarketOpen] = useState(false)
  const { prefs, setPrefs } = usePreferences()
  const location = useLocation()
  const isHome = location.pathname === '/'

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname])

  const cycleTheme = () => {
    const order: Array<'dark' | 'light' | 'system'> = ['dark', 'light', 'system']
    const idx = order.indexOf(prefs.theme)
    setPrefs({ theme: order[(idx + 1) % 3] })
  }

  const ThemeIcon = prefs.theme === 'dark' ? Moon : prefs.theme === 'light' ? Sun : Monitor

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300
          ${scrolled || !isHome
            ? 'bg-[var(--bg-surface)]/95 backdrop-blur-md border-b border-[var(--border-light)] shadow-sm'
            : 'bg-transparent'
          }`}
      >
        <div className="container h-14 sm:h-16 flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 flex-shrink-0 group">
            <div className="w-8 h-8 rounded-[8px] bg-[var(--accent)] flex items-center justify-center
              group-hover:shadow-[0_0_12px_var(--accent-glow)] transition-shadow">
              <Film size={16} className="text-[#080c14]" />
            </div>
            <span className="text-lg font-bold tracking-wide hidden sm:block">
              <span className="text-[var(--accent)]">MO</span>
              <span className="text-[var(--text-primary)]">VI</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 ml-4">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-3 py-1.5 rounded-[var(--radius)] text-sm font-medium
                  transition-colors duration-150
                  ${location.pathname === link.href.split('?')[0]
                    ? 'text-[var(--accent)] bg-[var(--accent-glow)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]'
                  }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search (desktop inline) */}
          {!isHome && (
            <div className="hidden md:block w-64 lg:w-80">
              <SearchBar size="compact" />
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search toggle (mobile / home) */}
            {(isHome || true) && (
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="p-2 rounded-[var(--radius)] text-[var(--text-secondary)]
                  hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]
                  transition-colors md:hidden"
                aria-label="Search"
              >
                <Search size={18} />
              </button>
            )}

            {/* Market selector */}
            <div className="relative">
              <button
                onClick={() => setMarketOpen((v) => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[var(--radius)]
                  text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                  hover:bg-[var(--bg-card)] transition-colors"
              >
                <Globe size={14} />
                <span className="hidden sm:inline font-medium">{prefs.market}</span>
                <span className="sm:hidden">{MARKET_FLAGS[prefs.market] ?? prefs.market}</span>
                <ChevronDown size={12} />
              </button>

              {marketOpen && (
                <div
                  className="absolute right-0 top-full mt-2 w-48 z-50
                    bg-[var(--bg-modal)] border border-[var(--border)]
                    rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)] overflow-hidden"
                >
                  <div className="p-2">
                    <p className="text-xs text-[var(--text-muted)] px-2 py-1 mb-1">Select market</p>
                    {markets.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => { setPrefs({ market: m.id }); setMarketOpen(false) }}
                        className={`w-full flex items-center gap-2.5 px-2 py-2
                          rounded-[var(--radius)] text-sm transition-colors
                          ${prefs.market === m.id
                            ? 'bg-[var(--accent-glow)] text-[var(--accent)]'
                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'
                          }`}
                      >
                        <span>{MARKET_FLAGS[m.id] ?? '🌐'}</span>
                        <span>{m.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button
              onClick={cycleTheme}
              className="p-2 rounded-[var(--radius)] text-[var(--text-secondary)]
                hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors"
              aria-label={`Theme: ${prefs.theme}`}
              title={`Theme: ${prefs.theme}`}
            >
              <ThemeIcon size={16} />
            </button>

            {/* Watchlist */}
            <Link
              to="/watchlist"
              className="p-2 rounded-[var(--radius)] text-[var(--text-secondary)]
                hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)] transition-colors
                relative"
              aria-label="Watchlist"
            >
              <Bookmark size={16} />
              {prefs.watchlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full
                  bg-[var(--accent)] text-[#080c14] text-[10px] font-bold
                  flex items-center justify-center">
                  {prefs.watchlist.length > 9 ? '9+' : prefs.watchlist.length}
                </span>
              )}
            </Link>

            {/* Mobile menu */}
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-2 rounded-[var(--radius)] text-[var(--text-secondary)]
                hover:text-[var(--text-primary)] hover:bg-[var(--bg-card)]
                transition-colors lg:hidden"
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile search */}
        {searchOpen && (
          <div className="px-4 pb-3 md:hidden border-t border-[var(--border-light)] pt-3">
            <SearchBar autoFocus />
          </div>
        )}
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMenuOpen(false)} />
          <div className="absolute top-14 sm:top-16 left-0 right-0
            bg-[var(--bg-modal)] border-b border-[var(--border)] shadow-lg">
            <nav className="container py-4 flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-3 py-3 rounded-[var(--radius)] text-base font-medium
                    text-[var(--text-secondary)] hover:text-[var(--text-primary)]
                    hover:bg-[var(--bg-card)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* Click outside market */}
      {marketOpen && (
        <div className="fixed inset-0 z-30" onClick={() => setMarketOpen(false)} />
      )}
    </>
  )
}
