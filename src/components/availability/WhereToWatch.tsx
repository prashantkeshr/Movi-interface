import { ExternalLink, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import type { AvailabilityEntry } from '@/types'

interface WhereToWatchProps {
  availability: AvailabilityEntry[]
  market: string
}

const TYPE_LABEL: Record<string, string> = {
  subscription: 'Subscription',
  free: 'Free',
  ad_supported: 'Free with Ads',
  rent: 'Rent',
  buy: 'Buy',
  streaming: 'Stream',
  other: 'Available',
}

const TYPE_COLOR: Record<string, string> = {
  subscription: 'text-[var(--blue)]',
  free: 'text-[var(--green)]',
  ad_supported: 'text-[var(--green)]',
  rent: 'text-amber-400',
  buy: 'text-purple-400',
  streaming: 'text-[var(--blue)]',
}

const STATUS_ICON: Record<string, React.ReactNode> = {
  confirmed: <CheckCircle size={10} className="text-[var(--green)]" />,
  recently_verified: <CheckCircle size={10} className="text-[var(--green)]" />,
  unverified: <AlertCircle size={10} className="text-amber-400" />,
  historical: <Clock size={10} className="text-[var(--text-muted)]" />,
}

function ProviderLogo({ name, color }: { name: string; color?: string }) {
  const initials = name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  return (
    <div
      className="w-10 h-10 rounded-[var(--radius)] flex items-center justify-center
        text-white text-xs font-bold flex-shrink-0 border border-[var(--border)]"
      style={{ backgroundColor: color ?? '#2a3450' }}
      title={name}
    >
      {initials}
    </div>
  )
}

const PROVIDER_COLORS: Record<string, string> = {
  'netflix': '#E50914',
  'prime video': '#00A8E1',
  'disney+ hotstar': '#1E4799',
  'apple tv+': '#444',
  'zee5': '#7B2D8B',
  'mubi': '#00A0E4',
  'youtube movies': '#FF0000',
  'jiocinema': '#4A0080',
}

export function WhereToWatch({ availability, market }: WhereToWatchProps) {
  if (!availability.length) {
    return (
      <div className="rounded-[var(--radius-lg)] border border-[var(--border)]
        bg-[var(--bg-card)] p-6 text-center">
        <p className="text-[var(--text-muted)] text-sm">
          No availability information for {market}.
        </p>
        <p className="text-[var(--text-muted)] text-xs mt-1">
          Try selecting a different market.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {availability.map((entry) => {
        const color = PROVIDER_COLORS[entry.providerName.toLowerCase()]
        const typeLabel = TYPE_LABEL[entry.type] ?? 'Available'
        const typeColor = TYPE_COLOR[entry.type] ?? 'text-[var(--text-secondary)]'

        return (
          <div
            key={entry.id}
            className="flex items-center gap-4 p-4 rounded-[var(--radius-lg)]
              bg-[var(--bg-card)] border border-[var(--border-light)]
              hover:border-[var(--border)] transition-colors"
          >
            <ProviderLogo name={entry.providerName} color={color} />

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                {entry.providerName}
              </p>
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                <span className={`text-xs font-medium ${typeColor}`}>
                  {typeLabel}
                </span>
                {entry.price && (
                  <span className="text-xs text-[var(--text-muted)]">
                    {entry.currency === 'INR' ? '₹' : entry.currency === 'USD' ? '$' : ''}
                    {entry.price}
                  </span>
                )}
                {entry.resolution && (
                  <span className="text-[10px] px-1 py-0.5 rounded-[3px]
                    bg-[var(--bg-base)] text-[var(--text-muted)] border border-[var(--border)]
                    font-semibold uppercase">
                    {entry.resolution}
                  </span>
                )}
              </div>
              {entry.audioLanguages && entry.audioLanguages.length > 0 && (
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  Audio: {entry.audioLanguages.map((l) => l.toUpperCase()).join(' · ')}
                </p>
              )}
            </div>

            <div className="flex flex-col items-end gap-2 flex-shrink-0">
              {entry.officialUrl && (
                <a
                  href={entry.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-xs font-medium
                    text-[var(--accent)] hover:text-[var(--accent-dim)]
                    transition-colors"
                >
                  Watch <ExternalLink size={11} />
                </a>
              )}
              {entry.lastVerified && (
                <div className="flex items-center gap-1">
                  {STATUS_ICON[entry.status] ?? null}
                  <span className="text-[10px] text-[var(--text-muted)]">
                    {entry.lastVerified}
                  </span>
                </div>
              )}
            </div>
          </div>
        )
      })}

      <p className="text-[10px] text-[var(--text-muted)] text-center mt-1">
        Availability data may change. Always verify on the provider before subscribing.
      </p>
    </div>
  )
}
