import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Play, Bookmark, BookmarkCheck, Heart, HeartOff, Share2,
  Globe, Clock, Star, Calendar, ChevronRight, ExternalLink,
  Info, Film
} from 'lucide-react'
import type { Content, AvailabilityEntry } from '@/types'
import { loadContent, loadAvailability, getAvailabilityForContent, loadCollectionIndex } from '@/services/dataLoader'
import { getTopContent, resolvePersonName } from '@/services/searchEngine'
import { getRelatedContent, getContentCollections } from '@/services/intelligenceEngine'
import type { CollectionData, CollectionSummary } from '@/services/intelligenceEngine'
import { WhereToWatch } from '@/components/availability/WhereToWatch'
import { ContentRow } from '@/components/content/ContentRow'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'
import { Skeleton } from '@/components/ui/Skeleton'
import { usePreferences } from '@/hooks/usePreferences'
import { useDocumentMeta } from '@/hooks/useDocumentMeta'

const LANG_NAMES: Record<string, string> = {
  en: 'English', hi: 'Hindi', te: 'Telugu', ta: 'Tamil',
  ml: 'Malayalam', kn: 'Kannada', ja: 'Japanese', ko: 'Korean',
  fr: 'French', de: 'German', es: 'Spanish', bn: 'Bengali', mr: 'Marathi',
}

const TYPE_LABEL: Record<string, string> = {
  movie: 'Movie', animation: 'Animation', documentary: 'Documentary',
  short_film: 'Short Film', anime_film: 'Anime Film', tv_movie: 'TV Movie',
  concert_film: 'Concert Film', special: 'Special', anthology: 'Anthology',
}

export function MoviePage() {
  const { id } = useParams<{ id: string }>()
  const [content, setContent] = useState<Content | null>(null)
  const [availability, setAvailability] = useState<AvailabilityEntry[]>([])
  const [collections, setCollections] = useState<CollectionData[]>([])
  const [loading, setLoading] = useState(true)
  const [trailerOpen, setTrailerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'availability' | 'cast' | 'details'>('overview')
  const [imgBdError, setImgBdError] = useState(false)
  const { prefs, toggleWatchlist, toggleFavorite, addRecentlyViewed } = usePreferences()

  const inWatchlist = prefs.watchlist.includes(id ?? '')
  const isFavorite = prefs.favorites.includes(id ?? '')

  const allContent = getTopContent(20)
  const related = content
    ? getRelatedContent(content, allContent, collections, 8)
    : allContent.filter((i) => i.id !== id).slice(0, 8)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setContent(null)
    setAvailability([])
    setImgBdError(false)
    setActiveTab('overview')

    Promise.all([
      loadContent(id),
      loadAvailability(prefs.market),
      loadCollectionIndex(),
    ])
      .then(([c, avail, colIndex]) => {
        setContent(c)
        setAvailability(getAvailabilityForContent(avail, id))
        addRecentlyViewed(id)
        // Fetch full collection data to enable intelligent related content
        Promise.all(
          (colIndex as unknown as CollectionData[])
            .filter((col) => col.parts?.some((p) => p.contentId === id))
            .map((col) =>
              fetch(`/data/v1/collections/${col.id}.json`).then((r) => r.json() as Promise<CollectionData>)
            )
        ).then(setCollections).catch(() => {})
      })
      .catch((e) => console.error('Failed to load content:', e))
      .finally(() => setLoading(false))
  }, [id, prefs.market])

  const imdbUrl = content?.externalIds?.find((e) => e.source === 'imdb')?.url
  const trailer = content?.trailers?.[0]
  const primaryRating = content?.ratings?.[0]
  const contentCollections = content ? getContentCollections(content.id, collections) : []

  useDocumentMeta({
    title: content ? `${content.title} (${content.year})` : 'Loading…',
    description: content?.overview ?? undefined,
    image: content?.posterPath
      ? `https://image.tmdb.org/t/p/w500${content.posterPath}`
      : undefined,
    type: 'video.movie',
    jsonLd: content
      ? {
          '@context': 'https://schema.org',
          '@type': 'Movie',
          name: content.title,
          description: content.overview,
          datePublished: String(content.year),
          url: `https://movi.dhurta.org/movie/${content.id}`,
          image: content.posterPath
            ? `https://image.tmdb.org/t/p/w500${content.posterPath}`
            : undefined,
          ...(primaryRating && {
            aggregateRating: {
              '@type': 'AggregateRating',
              ratingValue: primaryRating.value,
              bestRating: primaryRating.scale ?? 10,
            },
          }),
          ...(content.directors?.length && {
            director: content.directors.map((d) => ({
              '@type': 'Person',
              name: resolvePersonName(d),
            })),
          }),
          genre: content.genres,
        }
      : null,
  })

  if (loading) {
    return (
      <main className="pt-14 sm:pt-16 min-h-screen">
        <Skeleton className="w-full h-[50vh]" style={{ borderRadius: 0 }} />
        <div className="container py-8">
          <div className="flex gap-6">
            <Skeleton className="w-32 h-48 rounded-[var(--radius-lg)] flex-shrink-0 hidden sm:block" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-5 w-1/2" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (!content) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Film size={40} className="mx-auto mb-4 text-[var(--text-muted)]" />
          <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Content not found</h1>
          <p className="text-[var(--text-muted)] mb-4">This record doesn't exist in the registry.</p>
          <Link to="/" className="text-[var(--accent)] hover:underline text-sm">← Back to home</Link>
        </div>
      </main>
    )
  }

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'availability', label: `Where to Watch${availability.length > 0 ? ` (${availability.length})` : ''}` },
    { id: 'cast', label: 'Cast & Crew' },
    { id: 'details', label: 'Details' },
  ]

  return (
    <main className="min-h-screen">
      {/* ── Hero backdrop ── */}
      <section className="relative h-[55vh] min-h-[360px] sm:h-[65vh] overflow-hidden">
        {!imgBdError && content.backdropPath ? (
          <img
            src={content.backdropPath}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgBdError(true)}
            aria-hidden
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-surface)] to-[var(--bg-card)]" />
        )}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(9,13,24,0.3) 0%, rgba(9,13,24,0.6) 50%, #090d18 100%)' }}
        />

        {/* Actions row at top */}
        <div className="absolute top-16 sm:top-20 left-0 right-0 z-10">
          <div className="container flex items-center gap-2">
            <Link
              to="/"
              className="text-xs text-white/60 hover:text-white/90 transition-colors"
            >
              Home
            </Link>
            <ChevronRight size={12} className="text-white/40" />
            <Link
              to="/search"
              className="text-xs text-white/60 hover:text-white/90 transition-colors"
            >
              Movies
            </Link>
            <ChevronRight size={12} className="text-white/40" />
            <span className="text-xs text-white/60 truncate max-w-[200px]">{content.title}</span>
          </div>
        </div>
      </section>

      {/* ── Main content ── */}
      <div className="container -mt-20 relative z-10 pb-16">
        <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 w-32 sm:w-40 md:w-48 mx-auto sm:mx-0">
            <div className="rounded-[var(--radius-xl)] overflow-hidden shadow-[var(--shadow-xl)]
              border border-[var(--border)]" style={{ aspectRatio: '2/3' }}>
              {content.posterPath ? (
                <img
                  src={content.posterPath}
                  alt={`${content.title} poster`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-[var(--bg-card)] flex items-center justify-center">
                  <Film size={32} className="text-[var(--text-muted)]" />
                </div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 pt-0 sm:pt-6">
            {/* Type badge */}
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <Badge variant="outline" size="sm">
                {TYPE_LABEL[content.type] ?? content.type}
              </Badge>
              {content.franchise && (
                <Badge variant="muted" size="sm">Franchise</Badge>
              )}
              {contentCollections.map((col) => (
                <Link
                  key={col.id}
                  to={`/collection/${col.id}`}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                    text-[10px] font-semibold border transition-colors hover:opacity-80"
                  style={{
                    color: col.color ?? 'var(--accent)',
                    borderColor: `${col.color ?? 'var(--accent)'}40`,
                    background: `${col.color ?? 'var(--accent)'}12`,
                  }}
                >
                  {col.name}
                </Link>
              ))}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[var(--text-primary)] leading-tight">
              {content.title}
            </h1>
            {content.originalTitle && content.originalTitle !== content.title && (
              <p className="text-sm text-[var(--text-muted)] mt-1">{content.originalTitle}</p>
            )}
            {content.tagline && (
              <p className="text-sm italic text-[var(--text-secondary)] mt-1">"{content.tagline}"</p>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-3 mt-3">
              {content.year > 0 && (
                <span className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                  <Calendar size={13} /> {content.year}
                </span>
              )}
              {content.runtime && (
                <span className="flex items-center gap-1 text-sm text-[var(--text-secondary)]">
                  <Clock size={13} /> {Math.floor(content.runtime / 60)}h {content.runtime % 60}m
                </span>
              )}
              {content.rating && <StarRating rating={content.rating} />}
              {primaryRating && (
                <span className="text-xs text-[var(--text-muted)]">
                  {primaryRating.source}: {primaryRating.value}
                  {primaryRating.scale ? `/${primaryRating.scale}` : ''}
                  {primaryRating.count ? ` (${(primaryRating.count / 1000).toFixed(0)}K)` : ''}
                </span>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              {content.genres.map((g) => (
                <Link
                  key={g}
                  to={`/search?genre=${encodeURIComponent(g)}`}
                  className="px-2.5 py-1 rounded-full text-xs font-medium
                    bg-[var(--bg-card)] border border-[var(--border)]
                    text-[var(--text-secondary)] hover:border-[var(--accent)]/50
                    hover:text-[var(--accent)] transition-colors"
                >
                  {g}
                </Link>
              ))}
            </div>

            {/* Languages */}
            {content.languages.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Globe size={13} className="text-[var(--text-muted)]" />
                {content.languages.map((l) => (
                  <span key={l} className="text-xs text-[var(--text-muted)]">
                    {LANG_NAMES[l] ?? l.toUpperCase()}
                  </span>
                ))}
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-2 mt-5">
              {trailer && (
                <button
                  onClick={() => setTrailerOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-lg)]
                    bg-[var(--accent)] text-[#080c14] font-semibold text-sm
                    hover:bg-[var(--accent-dim)] transition-colors shadow-sm"
                >
                  <Play size={15} className="fill-[#080c14]" /> Play Trailer
                </button>
              )}
              <button
                onClick={() => toggleWatchlist(content.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-lg)]
                  text-sm font-medium border transition-colors
                  ${inWatchlist
                    ? 'bg-[var(--accent-glow)] border-[var(--accent)]/40 text-[var(--accent)]'
                    : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
              >
                {inWatchlist
                  ? <><BookmarkCheck size={14} /> In Watchlist</>
                  : <><Bookmark size={14} /> Watchlist</>}
              </button>
              <button
                onClick={() => toggleFavorite(content.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-lg)]
                  text-sm font-medium border transition-colors
                  ${isFavorite
                    ? 'bg-red-500/15 border-red-500/30 text-red-400'
                    : 'bg-[var(--bg-card)] border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
              >
                {isFavorite ? <><HeartOff size={14} /> Unfavorite</> : <><Heart size={14} /> Favorite</>}
              </button>
              {imdbUrl && (
                <a
                  href={imdbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-[var(--radius-lg)]
                    text-sm font-medium border border-[var(--border)]
                    bg-[var(--bg-card)] text-[var(--text-secondary)]
                    hover:text-[var(--text-primary)] transition-colors"
                >
                  IMDb <ExternalLink size={12} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-10 border-b border-[var(--border)]">
          <div className="flex gap-0 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors
                  border-b-2 -mb-px
                  ${activeTab === tab.id
                    ? 'border-[var(--accent)] text-[var(--accent)]'
                    : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6">
          {/* Overview */}
          {activeTab === 'overview' && (
            <div className="max-w-3xl space-y-6">
              <p className="text-[var(--text-secondary)] leading-relaxed">{content.overview}</p>

              {content.directors && content.directors.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Director</h3>
                  <div className="flex flex-wrap gap-2">
                    {content.directors.map((d) => (
                      <Link
                        key={d}
                        to={`/person/${d}`}
                        className="text-sm text-[var(--text-secondary)] bg-[var(--bg-card)]
                          px-2.5 py-1 rounded-[var(--radius)] border border-[var(--border)]
                          hover:border-[var(--accent)]/50 hover:text-[var(--accent)] transition-colors"
                      >
                        {resolvePersonName(d)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {content.productionCompanies && content.productionCompanies.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Production</h3>
                  <p className="text-sm text-[var(--text-secondary)]">{content.productionCompanies.join(' · ')}</p>
                </div>
              )}

              {content.keywords && content.keywords.length > 0 && (
                <div>
                  <h3 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Keywords</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {content.keywords.map((k) => (
                      <span key={k} className="text-xs text-[var(--text-muted)] bg-[var(--bg-card)]
                        px-2 py-0.5 rounded border border-[var(--border-light)]">{k}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Where to Watch */}
          {activeTab === 'availability' && (
            <div className="max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                  Where to Watch in {prefs.market}
                </h2>
                <Link to="/discover" className="text-xs text-[var(--accent)] flex items-center gap-1">
                  Change market <ChevronRight size={12} />
                </Link>
              </div>
              <WhereToWatch availability={availability} market={prefs.market} />
            </div>
          )}

          {/* Cast */}
          {activeTab === 'cast' && (
            <div className="max-w-3xl">
              {content.cast && content.cast.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {content.cast.map((member) => (
                    <div
                      key={member.personId}
                      className="flex items-center gap-3 p-3 rounded-[var(--radius-lg)]
                        bg-[var(--bg-card)] border border-[var(--border-light)]"
                    >
                      <div className="w-10 h-10 rounded-full bg-[var(--bg-surface)]
                        border border-[var(--border)] flex items-center justify-center
                        text-sm font-bold text-[var(--accent)] flex-shrink-0">
                        {member.name.split(' ').map((w) => w[0]).join('').slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{member.name}</p>
                        {member.character && (
                          <p className="text-xs text-[var(--text-muted)] truncate">{member.character}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[var(--text-muted)] text-sm">Cast information not available.</p>
              )}
            </div>
          )}

          {/* Details */}
          {activeTab === 'details' && (
            <div className="max-w-2xl">
              <dl className="space-y-4">
                {[
                  ['Type', TYPE_LABEL[content.type] ?? content.type],
                  ['Release Year', content.year?.toString()],
                  ['Runtime', content.runtime ? `${Math.floor(content.runtime / 60)}h ${content.runtime % 60}m` : null],
                  ['Original Title', content.originalTitle !== content.title ? content.originalTitle : null],
                  ['Languages', content.languages.map((l) => LANG_NAMES[l] ?? l).join(', ')],
                  ['Countries', content.countries?.join(', ')],
                  ['Production', content.productionCompanies?.join(', ')],
                  content.externalIds?.find((e) => e.source === 'imdb')
                    ? ['IMDb ID', content.externalIds.find((e) => e.source === 'imdb')!.id]
                    : null,
                  content.externalIds?.find((e) => e.source === 'tmdb')
                    ? ['TMDB ID', content.externalIds.find((e) => e.source === 'tmdb')!.id]
                    : null,
                ].filter(Boolean).map((row) => {
                  const [label, val] = row as [string, string]
                  return val ? (
                    <div key={label} className="flex gap-4 py-3 border-b border-[var(--border-light)]">
                      <dt className="w-36 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide
                        flex-shrink-0 pt-0.5">{label}</dt>
                      <dd className="text-sm text-[var(--text-secondary)] flex-1">{val}</dd>
                    </div>
                  ) : null
                })}
              </dl>

              {content.sources && content.sources.length > 0 && (
                <div className="mt-6 p-4 rounded-[var(--radius-lg)] bg-[var(--bg-card)]
                  border border-[var(--border)] flex items-start gap-3">
                  <Info size={14} className="text-[var(--text-muted)] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-[var(--text-muted)] mb-1">Data Sources</p>
                    {content.sources.map((s) => (
                      <p key={s.id} className="text-xs text-[var(--text-muted)]">
                        {s.name}{s.license ? ` · ${s.license}` : ''}
                      </p>
                    ))}
                    {content.lastUpdated && (
                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Updated: {content.lastUpdated.split('T')[0]}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Related */}
        <div className="mt-16">
          <ContentRow
            title="You might also like"
            items={related.slice(0, 8)}
            seeAllHref="/discover"
          />
        </div>
      </div>

      {/* Trailer modal */}
      <Modal isOpen={trailerOpen} onClose={() => setTrailerOpen(false)} size="xl">
        {trailer && (
          <div className="relative pt-[56.25%]">
            <iframe
              className="absolute inset-0 w-full h-full"
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1`}
              title={trailer.name}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
      </Modal>
    </main>
  )
}
