import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Globe, Database, Zap, TrendingUp } from 'lucide-react'
import { SearchBar } from '@/components/search/SearchBar'
import { ContentRow } from '@/components/content/ContentRow'
import type { SearchIndexEntry, DataManifest } from '@/types'
import { getTopContent, getFeaturedContent, getByGenre } from '@/services/searchEngine'
import { loadManifest } from '@/services/dataLoader'
import { usePreferences } from '@/hooks/usePreferences'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

const GENRES_TO_SHOW = ['Action', 'Drama', 'Science Fiction', 'Animation', 'Thriller']

const HERO_ITEMS = [
  {
    title: 'Track every movie.',
    subtitle: 'across every market.',
    bg: 'https://image.tmdb.org/t/p/w1280/s3TBrRGB1iav7gFOCNx3H31MoES.jpg',
  },
  {
    title: 'Find where to watch.',
    subtitle: 'in your country.',
    bg: 'https://image.tmdb.org/t/p/w1280/rAiYTfKGqDCRIIqo664sY9XZIvQ.jpg',
  },
  {
    title: 'Discover world cinema.',
    subtitle: 'from every language.',
    bg: 'https://image.tmdb.org/t/p/w1280/ApiBzeaa95TNYliSbQ8pJv4Fje7.jpg',
  },
]

const STATS = [
  { icon: <Database size={18} />, value: '15+', label: 'Content Records' },
  { icon: <Globe size={18} />, value: '6', label: 'Markets' },
  { icon: <Zap size={18} />, value: '8', label: 'Providers' },
  { icon: <TrendingUp size={18} />, value: '42+', label: 'Availability Links' },
]

export function HomePage() {
  const [heroIdx, setHeroIdx] = useState(0)
  const [trending, setTrending] = useState<SearchIndexEntry[]>([])
  const [topRated, setTopRated] = useState<SearchIndexEntry[]>([])
  const [genreSections, setGenreSections] = useState<{ genre: string; items: SearchIndexEntry[] }[]>([])
  const [manifest, setManifest] = useState<DataManifest | null>(null)
  const [imgError, setImgError] = useState(false)

  useDocumentMeta({
    title: 'MOVI — Global Content Intelligence & Streaming Registry',
    description:
      'Discover where to stream 15 top films across 6 global markets. MOVI — your global streaming availability registry.',
  })
  const { prefs } = usePreferences()
  const navigate = useNavigate()

  useEffect(() => {
    setTrending(getTopContent(12))
    setTopRated(getFeaturedContent(8))
    setGenreSections(
      GENRES_TO_SHOW.map((g) => ({ genre: g, items: getByGenre(g, 8) })).filter((s) => s.items.length > 0)
    )
    loadManifest().then(setManifest).catch(() => null)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setHeroIdx((i) => (i + 1) % HERO_ITEMS.length), 6000)
    return () => clearInterval(timer)
  }, [])

  const hero = HERO_ITEMS[heroIdx]

  return (
    <main>
      {/* ── Hero ── */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center overflow-hidden">
        {/* Background */}
        {!imgError && (
          <img
            key={hero.bg}
            src={hero.bg}
            alt=""
            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-1000"
            onError={() => setImgError(true)}
            aria-hidden
          />
        )}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(9,13,24,0.5) 0%, rgba(9,13,24,0.75) 60%, #090d18 100%)' }}
        />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(9,13,24,0.8) 100%)' }}
        />

        {/* Hero dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {HERO_ITEMS.map((_, i) => (
            <button
              key={i}
              onClick={() => setHeroIdx(i)}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300
                ${i === heroIdx ? 'bg-[var(--accent)] w-4' : 'bg-white/30'}`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="relative z-10 container text-center px-4 pt-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6
            bg-[var(--accent)]/15 border border-[var(--accent)]/30
            text-[var(--accent)] text-xs font-semibold tracking-wide uppercase">
            <Globe size={12} /> Global Content Intelligence Registry
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold
            text-white leading-tight mb-2 transition-all duration-500">
            {hero.title}
          </h1>
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold
            text-[var(--accent)] leading-tight mb-6 transition-all duration-500">
            {hero.subtitle}
          </h2>

          <p className="text-base sm:text-lg text-white/70 max-w-xl mx-auto mb-10">
            Search any movie. Discover where to stream, rent, or buy it — in any country, on any platform.
          </p>

          <div className="max-w-2xl mx-auto mb-6">
            <SearchBar
              size="hero"
              placeholder="Search movies, people, providers... try 'spidr man'"
              onSearch={(q) => navigate(`/search?q=${encodeURIComponent(q)}`)}
            />
          </div>

          <div className="flex flex-wrap justify-center gap-2 text-xs text-white/50">
            {['Inception', 'RRR', '3 Idiots', 'Parasite', 'Spirited Away'].map((s) => (
              <button
                key={s}
                onClick={() => navigate(`/search?q=${encodeURIComponent(s)}`)}
                className="px-3 py-1 rounded-full border border-white/15
                  hover:border-white/40 hover:text-white/80 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-y border-[var(--border-light)] bg-[var(--bg-surface)]">
        <div className="container py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {STATS.map((s, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[var(--radius)] bg-[var(--accent-glow)]
                  border border-[var(--accent)]/20 flex items-center justify-center
                  text-[var(--accent)] flex-shrink-0">
                  {s.icon}
                </div>
                <div>
                  <p className="text-xl font-bold text-[var(--text-primary)] tabular-nums">{s.value}</p>
                  <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Content ── */}
      <div className="container py-12 flex flex-col gap-12">
        <ContentRow
          title="Trending Now"
          subtitle={`Popular in ${prefs.market}`}
          items={trending}
          seeAllHref="/discover"
          cardSize="md"
        />

        <ContentRow
          title="Top Rated"
          subtitle="Critically acclaimed"
          items={topRated}
          seeAllHref="/search?sort=rating"
          cardSize="md"
        />

        {genreSections.map(({ genre, items }) => (
          <ContentRow
            key={genre}
            title={genre}
            items={items}
            seeAllHref={`/search?genre=${encodeURIComponent(genre)}`}
            cardSize="sm"
          />
        ))}

        {/* Market explorer teaser */}
        <section className="rounded-[var(--radius-2xl)] overflow-hidden border border-[var(--border)]
          bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-card)] p-8 md:p-10">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <Globe size={16} className="text-[var(--accent)]" />
              <span className="text-xs font-semibold text-[var(--accent)] uppercase tracking-wide">
                Global Availability
              </span>
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
              Movies don't stop at borders.
            </h2>
            <p className="text-[var(--text-secondary)] mb-6 text-sm leading-relaxed">
              Every movie is available differently depending on where you are. MOVI tracks availability
              across {manifest?.marketCount ?? 6} markets so you know exactly where to find it.
            </p>
            <div className="flex flex-wrap gap-2">
              {['🇮🇳 India', '🇺🇸 USA', '🇬🇧 UK', '🇯🇵 Japan', '🇰🇷 Korea', '🇦🇺 Australia'].map((m) => (
                <span key={m} className="px-3 py-1 rounded-full text-sm
                  bg-[var(--bg-card)] border border-[var(--border)]
                  text-[var(--text-secondary)]">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Developer teaser */}
        <section className="rounded-[var(--radius-2xl)] border border-[var(--accent)]/20
          bg-[var(--accent-glow)] p-8 md:p-10">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-3
              bg-[var(--accent)]/15 text-[var(--accent)] text-xs font-semibold">
              <Database size={12} /> Static Developer API
            </div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
              Built for developers too.
            </h2>
            <p className="text-[var(--text-secondary)] mb-4 text-sm">
              Every content record, availability entry and schema is available as clean JSON.
              No API key. No rate limits. Just structured data.
            </p>
            <div className="bg-[var(--bg-base)] rounded-[var(--radius-lg)] p-4 font-mono text-xs
              text-[var(--accent)] border border-[var(--border)] overflow-x-auto">
              GET /data/v1/content/content_001.json
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
