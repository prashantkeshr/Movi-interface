import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { Filter, X, SlidersHorizontal } from 'lucide-react'
import { SearchBar } from '@/components/search/SearchBar'
import { ContentCard } from '@/components/content/ContentCard'
import { Skeleton } from '@/components/ui/Skeleton'
import type { SearchIndexEntry } from '@/types'
import { search, getTopContent } from '@/services/searchEngine'
import { usePreferences } from '@/hooks/usePreferences'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

const CONTENT_TYPES = [
  { value: 'movie', label: 'Movies' },
  { value: 'animation', label: 'Animation' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'anime_film', label: 'Anime' },
  { value: 'short_film', label: 'Short Films' },
]

const GENRES = [
  'Action', 'Adventure', 'Animation', 'Biography', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Fantasy', 'History', 'Horror', 'Mystery',
  'Romance', 'Science Fiction', 'Sport', 'Thriller',
]

function FilterChip({
  label,
  active,
  onClick,
}: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-150
        ${active
          ? 'bg-[var(--accent)] text-[#080c14]'
          : 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border)] hover:border-[var(--accent)]/50 hover:text-[var(--text-primary)]'
        }`}
    >
      {label}
      {active && <span className="ml-1.5 opacity-70">×</span>}
    </button>
  )
}

export function SearchPage() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const [results, setResults] = useState<SearchIndexEntry[]>([])
  const [loading, setLoading] = useState(false)

  useDocumentMeta({
    title: 'Search',
    description: 'Search 15 films across 6 global markets on MOVI.',
  })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const { prefs, addRecentSearch } = usePreferences()

  const q = params.get('q') ?? ''
  const typeFilter = params.get('type') ?? ''
  const genreFilter = params.get('genre') ?? ''

  const activeGenres = genreFilter ? [genreFilter] : []
  const activeTypes = typeFilter ? [typeFilter] : []

  const doSearch = useCallback((query: string, types: string[], genres: string[]) => {
    setLoading(true)
    setTimeout(() => {
      const res = search(query || ' ', { types, genres })
      if (!query && types.length === 0 && genres.length === 0) {
        setResults(getTopContent(30))
      } else {
        setResults(res.map((r) => r.item))
      }
      setLoading(false)
    }, 50)
  }, [])

  useEffect(() => {
    doSearch(q, activeTypes, activeGenres)
    if (q) addRecentSearch(q)
  }, [q, typeFilter, genreFilter])

  const setFilter = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (next.get(key) === value) next.delete(key)
    else next.set(key, value)
    setParams(next)
  }

  const clearAll = () => {
    const next = new URLSearchParams()
    if (q) next.set('q', q)
    setParams(next)
  }

  const hasFilters = activeTypes.length > 0 || activeGenres.length > 0

  return (
    <main className="pt-20 pb-16 min-h-screen">
      <div className="container">
        {/* Search bar */}
        <div className="py-6 max-w-2xl">
          <SearchBar
            size="default"
            initialValue={q}
            onSearch={(query) => {
              const next = new URLSearchParams(params)
              if (query) next.set('q', query)
              else next.delete('q')
              setParams(next)
            }}
          />
        </div>

        {/* Filter row */}
        <div className="flex items-center gap-3 flex-wrap mb-6">
          <button
            onClick={() => setFiltersOpen((v) => !v)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-[var(--radius)]
              text-sm font-medium border transition-colors
              ${filtersOpen
                ? 'bg-[var(--accent-glow)] border-[var(--accent)]/40 text-[var(--accent)]'
                : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
          >
            <SlidersHorizontal size={14} />
            Filters
            {hasFilters && (
              <span className="w-4 h-4 rounded-full bg-[var(--accent)] text-[#080c14]
                text-[10px] font-bold flex items-center justify-center">
                {activeTypes.length + activeGenres.length}
              </span>
            )}
          </button>

          {CONTENT_TYPES.map((t) => (
            <FilterChip
              key={t.value}
              label={t.label}
              active={activeTypes.includes(t.value)}
              onClick={() => setFilter('type', t.value)}
            />
          ))}

          {hasFilters && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1 px-2 py-1.5 text-xs
                text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            >
              <X size={12} /> Clear filters
            </button>
          )}
        </div>

        {/* Genre filter panel */}
        {filtersOpen && (
          <div className="mb-6 p-4 rounded-[var(--radius-lg)] bg-[var(--bg-surface)]
            border border-[var(--border)]">
            <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-3">
              Genres
            </p>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <FilterChip
                  key={g}
                  label={g}
                  active={activeGenres.includes(g)}
                  onClick={() => setFilter('genre', g)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Results header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            {q ? (
              <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                Results for <span className="text-[var(--accent)]">"{q}"</span>
              </h1>
            ) : hasFilters ? (
              <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                Filtered results
              </h1>
            ) : (
              <h1 className="text-lg font-semibold text-[var(--text-primary)]">
                All Content
              </h1>
            )}
            {!loading && (
              <p className="text-sm text-[var(--text-muted)] mt-0.5">
                {results.length} {results.length === 1 ? 'result' : 'results'}
              </p>
            )}
          </div>
        </div>

        {/* Results grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="w-full aspect-[2/3] rounded-[var(--radius-lg)] mb-2" />
                <Skeleton className="h-4 w-3/4 rounded mb-1.5" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            ))}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {results.map((item) => (
              <ContentCard key={item.id} item={item} size="md" />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-card)] border border-[var(--border)]
              flex items-center justify-center mb-4">
              <Filter size={24} className="text-[var(--text-muted)]" />
            </div>
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              No results found
            </h2>
            <p className="text-sm text-[var(--text-muted)] max-w-xs mb-4">
              {q ? `No results for "${q}". Try different spelling or remove filters.` :
                'Try adjusting your filters.'}
            </p>
            {hasFilters && (
              <button
                onClick={clearAll}
                className="text-sm text-[var(--accent)] hover:text-[var(--accent-dim)] transition-colors"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
