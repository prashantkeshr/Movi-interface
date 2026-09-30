import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Globe, Film, Tv, BookOpen, Sparkles, Layers } from 'lucide-react'
import type { SearchIndexEntry } from '@/types'
import { ContentCard } from '@/components/content/ContentCard'
import { getTopContent, getByGenre } from '@/services/searchEngine'
import { loadCollectionIndex } from '@/services/dataLoader'
import type { CollectionSummary } from '@/services/intelligenceEngine'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

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
  const [collections, setCollections] = useState<CollectionSummary[]>([])

  useDocumentMeta({
    title: 'Discover',
    description: 'Explore top films by genre, market, and curated collections on MOVI.',
  })

  useEffect(() => {
    setTop(getTopContent(12))
    setActionItems(getByGenre('Action', 6))
    setDramaItems(getByGenre('Drama', 6))
    loadCollectionIndex().then(setCollections).catch(() => {})
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

        {/* Curated Collections */}
        {collections.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
              <span className="flex items-center gap-2">
                <Layers size={18} className="text-[var(--accent)]" />
                Curated Collections
              </span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {collections.map((col) => (
                <Link
                  key={col.id}
                  to={`/collection/${col.id}`}
                  className="relative overflow-hidden rounded-[var(--radius-xl)]
                    bg-[var(--bg-card)] border border-[var(--border-light)]
                    hover:border-[var(--border)] transition-all group p-5 flex flex-col gap-3"
                  style={{ borderLeft: `3px solid ${col.color ?? 'var(--accent)'}` }}
                >
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-[var(--text-primary)]
                        group-hover:text-[var(--accent)] transition-colors leading-snug">
                        {col.name}
                      </h3>
                      {col.tagline && (
                        <p className="text-xs italic text-[var(--text-muted)] mt-0.5 line-clamp-1">
                          "{col.tagline}"
                        </p>
                      )}
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <span className="text-lg font-bold" style={{ color: col.color ?? 'var(--accent)' }}>
                        {col.contentCount}
                      </span>
                      <p className="text-[10px] text-[var(--text-muted)]">films</p>
                    </div>
                  </div>

                  {/* Poster strip */}
                  <div className="flex gap-1.5">
                    {Array.from({ length: Math.min(col.contentCount, 4) }).map((_, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-[var(--radius)] overflow-hidden bg-[var(--bg-surface)]"
                        style={{ aspectRatio: '2/3' }}
                      />
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                    {col.averageRating && (
                      <span>★ {col.averageRating.toFixed(1)} avg</span>
                    )}
                    {col.totalRuntime && (
                      <span>
                        {Math.floor(col.totalRuntime / 60)}h {col.totalRuntime % 60}m total
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

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
