import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Globe, Film, Tv, BookOpen, Sparkles } from 'lucide-react'
import type { SearchIndexEntry } from '@/types'
import { ContentCard } from '@/components/content/ContentCard'
import { getTopContent, getByGenre } from '@/services/searchEngine'

const GENRES = [
  { name: 'Action', emoji: '💥' },
  { name: 'Drama', emoji: '🎭' },
  { name: 'Comedy', emoji: '😂' },
  { name: 'Thriller', emoji: '😰' },
  { name: 'Science Fiction', emoji: '🚀' },
  { name: 'Animation', emoji: '🎨' },
  { name: 'Documentary', emoji: '📽️' },
  { name: 'Horror', emoji: '👻' },
  { name: 'Biography', emoji: '📖' },
  { name: 'Fantasy', emoji: '✨' },
  { name: 'Sport', emoji: '🏆' },
  { name: 'History', emoji: '🏛️' },
]

const MARKETS = [
  { id: 'IN', name: 'India', flag: '🇮🇳' },
  { id: 'US', name: 'United States', flag: '🇺🇸' },
  { id: 'GB', name: 'United Kingdom', flag: '🇬🇧' },
  { id: 'JP', name: 'Japan', flag: '🇯🇵' },
  { id: 'KR', name: 'South Korea', flag: '🇰🇷' },
  { id: 'AU', name: 'Australia', flag: '🇦🇺' },
]

export function DiscoverPage() {
  const [top, setTop] = useState<SearchIndexEntry[]>([])
  const [actionItems, setActionItems] = useState<SearchIndexEntry[]>([])
  const [dramaItems, setDramaItems] = useState<SearchIndexEntry[]>([])

  useEffect(() => {
    setTop(getTopContent(12))
    setActionItems(getByGenre('Action', 6))
    setDramaItems(getByGenre('Drama', 6))
  }, [])

  return (
    <main className="pt-20 pb-16 min-h-screen">
      <div className="container">
        {/* Header */}
        <div className="py-8">
          <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-2">Discover</h1>
          <p className="text-[var(--text-secondary)]">
            Explore content from around the world
          </p>
        </div>

        {/* Browse by Genre */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Browse by Genre</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {GENRES.map((g) => (
              <Link
                key={g.name}
                to={`/search?genre=${encodeURIComponent(g.name)}`}
                className="flex flex-col items-center justify-center gap-2 p-4
                  rounded-[var(--radius-xl)] bg-[var(--bg-surface)] border border-[var(--border)]
                  hover:border-[var(--accent)]/50 hover:bg-[var(--bg-card)]
                  transition-all duration-200 group text-center"
              >
                <span className="text-2xl">{g.emoji}</span>
                <span className="text-xs font-medium text-[var(--text-secondary)]
                  group-hover:text-[var(--accent)] transition-colors">
                  {g.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Browse by Market */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
            <span className="flex items-center gap-2">
              <Globe size={18} className="text-[var(--accent)]" />
              Browse by Market
            </span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {MARKETS.map((m) => (
              <button
                key={m.id}
                className="flex items-center gap-3 p-4 rounded-[var(--radius-xl)]
                  bg-[var(--bg-surface)] border border-[var(--border)]
                  hover:border-[var(--accent)]/50 hover:bg-[var(--bg-card)]
                  transition-all duration-200 text-left"
              >
                <span className="text-2xl">{m.flag}</span>
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)]">{m.name}</p>
                  <p className="text-xs text-[var(--text-muted)]">{m.id}</p>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Top content */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[var(--text-primary)]">
              <span className="flex items-center gap-2">
                <Sparkles size={18} className="text-[var(--accent)]" />
                Top Content
              </span>
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {top.map((item) => (
              <ContentCard key={item.id} item={item} size="md" />
            ))}
          </div>
        </section>

        {/* Action */}
        {actionItems.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">💥 Action</h2>
              <Link to="/search?genre=Action" className="text-sm text-[var(--accent)]">See all</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {actionItems.map((item) => (
                <ContentCard key={item.id} item={item} size="sm" />
              ))}
            </div>
          </section>
        )}

        {/* Drama */}
        {dramaItems.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">🎭 Drama</h2>
              <Link to="/search?genre=Drama" className="text-sm text-[var(--accent)]">See all</Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {dramaItems.map((item) => (
                <ContentCard key={item.id} item={item} size="sm" />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
