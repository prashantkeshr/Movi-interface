import { Link } from 'react-router-dom'
import { Film } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-[var(--border-light)] bg-[var(--bg-surface)] mt-16">
      <div className="container py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 rounded-[7px] bg-[var(--accent)] flex items-center justify-center">
                <Film size={14} className="text-[#080c14]" />
              </div>
              <span className="text-base font-bold">
                <span className="text-[var(--accent)]">MO</span>
                <span className="text-[var(--text-primary)]">VI</span>
              </span>
            </Link>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-[200px]">
              A global content intelligence & streaming availability registry.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              Explore
            </h4>
            <ul className="space-y-2">
              {[['Discover', '/discover'], ['Movies', '/search?type=movie'], ['Providers', '/providers'], ['Markets', '/markets']].map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              Data
            </h4>
            <ul className="space-y-2">
              {[['Developers', '/developers'], ['API Docs', '/developers'], ['Schemas', '/developers#schemas'], ['Sources', '/about#sources']].map(([label, href]) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider mb-3">
              Platform
            </h4>
            <ul className="space-y-2">
              {[['About', '/about'], ['Changelog', '/changelog'], ['Status', '/about#status']].map(([label, href]) => (
                <li key={href}>
                  <Link to={href} className="text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between
          gap-3 pt-6 border-t border-[var(--border-light)]">
          <p className="text-xs text-[var(--text-muted)]">
            © 2026 MOVI — Media Outlet Verification Institute. A global content intelligence registry.
          </p>
          <div className="flex items-center gap-4">
            <p className="text-xs text-[var(--text-muted)]">
              Provider names & trademarks belong to respective owners.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
