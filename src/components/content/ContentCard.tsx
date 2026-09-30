import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Play, Star, Plus, Check } from 'lucide-react'
import type { SearchIndexEntry } from '@/types'
import { usePreferences } from '@/hooks/usePreferences'

interface ContentCardProps {
  item: SearchIndexEntry
  availability?: string[]
  size?: 'sm' | 'md' | 'lg'
}

const CONTENT_TYPE_LABEL: Record<string, string> = {
  movie: 'Movie',
  animation: 'Animation',
  documentary: 'Documentary',
  short_film: 'Short Film',
  anime_film: 'Anime',
  tv_movie: 'TV Movie',
  concert_film: 'Concert Film',
  special: 'Special',
  anthology: 'Anthology',
}

const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 300"><rect width="200" height="300" fill="%231e2740"/><text x="100" y="155" text-anchor="middle" fill="%2356607a" font-size="14" font-family="system-ui">No Image</text></svg>'

export function ContentCard({ item, availability, size = 'md' }: ContentCardProps) {
  const [imgError, setImgError] = useState(false)
  const [hovered, setHovered] = useState(false)
  const { prefs, toggleWatchlist } = usePreferences()
  const inWatchlist = prefs.watchlist.includes(item.id)

  const sizes: Record<string, string> = {
    sm: 'w-[130px] sm:w-[150px]',
    md: 'w-[155px] sm:w-[180px] md:w-[195px]',
    lg: 'w-[200px] sm:w-[220px] md:w-[240px]',
  }

  const contentHref = item.type === 'content' ? `/movie/${item.id}` :
    item.type === 'person' ? `/person/${item.id}` : `/provider/${item.id}`

  return (
    <div
      className={`${sizes[size]} flex-shrink-0 group`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={contentHref} className="block">
        <div
          className="relative overflow-hidden rounded-[var(--radius-lg)]
            border border-[var(--border-light)]
            transition-all duration-300 group-hover:border-[var(--accent)]/40
            group-hover:shadow-[0_8px_32px_rgba(232,184,75,0.15)]
            group-hover:-translate-y-1"
          style={{ aspectRatio: '2/3' }}
        >
          <img
            src={imgError || !item.posterPath ? PLACEHOLDER : item.posterPath}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500
              group-hover:scale-105"
            onError={() => setImgError(true)}
            loading="lazy"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(180deg, transparent 55%, rgba(9,13,24,0.92) 100%)' }}
          />

          {/* Hover overlay */}
          <div className={`absolute inset-0 bg-[var(--accent-glow)] transition-opacity duration-300
            ${hovered ? 'opacity-100' : 'opacity-0'}`}
          />

          {/* Play button */}
          {hovered && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-[var(--accent)]/90 flex items-center justify-center
                shadow-lg transition-transform scale-0 group-hover:scale-100 duration-200">
                <Play size={20} className="text-[#080c14] fill-[#080c14] ml-0.5" />
              </div>
            </div>
          )}

          {/* Rating badge */}
          {item.rating && (
            <div className="absolute top-2 right-2 flex items-center gap-1
              bg-black/70 backdrop-blur-sm rounded-[4px] px-1.5 py-0.5">
              <Star size={10} className="fill-[var(--accent)] text-[var(--accent)]" />
              <span className="text-[10px] font-semibold text-[var(--accent)] tabular-nums">
                {item.rating.toFixed(1)}
              </span>
            </div>
          )}

          {/* Watchlist button */}
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleWatchlist(item.id) }}
            className={`absolute top-2 left-2 w-7 h-7 rounded-full flex items-center justify-center
              transition-all duration-200
              ${hovered || inWatchlist ? 'opacity-100' : 'opacity-0'}
              ${inWatchlist
                ? 'bg-[var(--accent)] text-[#080c14]'
                : 'bg-black/60 text-white hover:bg-[var(--accent)] hover:text-[#080c14]'}`}
            aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
            title={inWatchlist ? 'In watchlist' : 'Add to watchlist'}
          >
            {inWatchlist ? <Check size={12} /> : <Plus size={12} />}
          </button>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 p-2.5">
            {availability && availability.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-1">
                {availability.slice(0, 2).map((p) => (
                  <span key={p} className="text-[9px] font-semibold px-1 py-0.5
                    bg-[var(--accent)]/20 text-[var(--accent)] rounded-[3px] truncate max-w-[60px]">
                    {p}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Card info below image */}
      <div className="mt-2 px-0.5">
        <Link to={contentHref}>
          <h3 className="text-sm font-medium text-[var(--text-primary)] truncate
            group-hover:text-[var(--accent)] transition-colors">
            {item.title}
          </h3>
        </Link>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">
          {item.year ? item.year : ''}
          {item.contentType && item.year && ' · '}
          {item.contentType && CONTENT_TYPE_LABEL[item.contentType]}
        </p>
      </div>
    </div>
  )
}
