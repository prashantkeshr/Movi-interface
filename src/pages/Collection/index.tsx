import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Star, Clock, Film, ChevronRight, ArrowLeft } from 'lucide-react'
import type { Content } from '@/types'
import { loadContent } from '@/services/dataLoader'
import type { CollectionData } from '@/services/intelligenceEngine'
import { formatRuntime } from '@/services/intelligenceEngine'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { StarRating } from '@/components/ui/StarRating'

async function fetchCollection(id: string): Promise<CollectionData> {
  const res = await fetch(`/data/v1/collections/${id}.json`)
  if (!res.ok) throw new Error(`Collection not found: ${id}`)
  return res.json() as Promise<CollectionData>
}

export function CollectionPage() {
  const { id } = useParams<{ id: string }>()
  const [collection, setCollection] = useState<CollectionData | null>(null)
  const [heroContent, setHeroContent] = useState<Content | null>(null)
  const [partContent, setPartContent] = useState<Record<string, Content>>({})
  const [loading, setLoading] = useState(true)
  const [imgError, setImgError] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)

    fetchCollection(id)
      .then(async (col) => {
        setCollection(col)

        const heroId = col.heroContentId ?? col.parts[0]?.contentId
        const contentIds = col.parts.map((p) => p.contentId)

        const [hero, ...rest] = await Promise.all([
          heroId ? loadContent(heroId) : Promise.resolve(null),
          ...contentIds.filter((cid) => cid !== heroId).map(loadContent),
        ])

        if (hero) setHeroContent(hero as Content)

        const map: Record<string, Content> = {}
        if (hero) map[(hero as Content).id] = hero as Content
        rest.forEach((c) => { if (c) map[c.id] = c })
        setPartContent(map)
      })
      .catch((e) => console.error('Failed to load collection:', e))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <main className="pt-14 min-h-screen">
        <Skeleton className="w-full h-[45vh]" style={{ borderRadius: 0 }} />
        <div className="container py-10">
          <Skeleton className="h-8 w-1/3 mb-3" />
          <Skeleton className="h-5 w-2/3 mb-8" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-full aspect-[2/3] rounded-[var(--radius-lg)]" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (!collection) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Film size={40} className="mx-auto mb-4 text-[var(--text-muted)]" />
          <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Collection not found</h1>
          <Link to="/discover" className="text-[var(--accent)] hover:underline text-sm">← Back to Discover</Link>
        </div>
      </main>
    )
  }

  const backdropUrl = !imgError && heroContent?.backdropPath ? heroContent.backdropPath : null
  const accentColor = collection.color ?? '#E8B84B'

  return (
    <main className="min-h-screen">
      {/* Hero */}
      <section className="relative h-[45vh] min-h-[300px] overflow-hidden">
        {backdropUrl ? (
          <img
            src={backdropUrl}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgError(true)}
            aria-hidden
          />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accentColor}22 0%, var(--bg-surface) 100%)` }} />
        )}
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, rgba(9,13,24,0.4) 0%, rgba(9,13,24,0.7) 60%, #090d18 100%)' }}
        />
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="container pb-8">
            <Link
              to="/discover"
              className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft size={13} /> Collections
            </Link>
            <div className="flex items-center gap-3 mb-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: accentColor }}
              />
              <span className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: accentColor }}>
                Curated Collection
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-1">
              {collection.name}
            </h1>
            {collection.tagline && (
              <p className="text-white/70 text-sm italic">"{collection.tagline}"</p>
            )}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-surface)]">
        <div className="container">
          <div className="flex items-center gap-6 py-4 overflow-x-auto">
            <div className="flex items-center gap-2 text-sm flex-shrink-0">
              <Film size={14} className="text-[var(--text-muted)]" />
              <span className="font-semibold text-[var(--text-primary)]">{collection.contentCount}</span>
              <span className="text-[var(--text-muted)]">Films</span>
            </div>
            {collection.averageRating && (
              <div className="flex items-center gap-2 text-sm flex-shrink-0">
                <Star size={14} className="text-[var(--accent)] fill-[var(--accent)]" />
                <span className="font-semibold text-[var(--text-primary)]">{collection.averageRating.toFixed(1)}</span>
                <span className="text-[var(--text-muted)]">Avg Rating</span>
              </div>
            )}
            {collection.totalRuntime && (
              <div className="flex items-center gap-2 text-sm flex-shrink-0">
                <Clock size={14} className="text-[var(--text-muted)]" />
                <span className="font-semibold text-[var(--text-primary)]">{formatRuntime(collection.totalRuntime)}</span>
                <span className="text-[var(--text-muted)]">Total Runtime</span>
              </div>
            )}
            {collection.curator && (
              <div className="ml-auto text-xs text-[var(--text-muted)] flex-shrink-0">
                Curated by {collection.curator}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container py-10">
        {/* Tags */}
        {collection.tags && collection.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-8">
            {collection.tags.map((tag) => (
              <Badge key={tag} variant="muted" size="sm">{tag}</Badge>
            ))}
          </div>
        )}

        {/* About */}
        {collection.description && (
          <div className="max-w-3xl mb-10">
            <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
              About this Collection
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed">{collection.description}</p>
          </div>
        )}

        {/* Films grid */}
        <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-5">
          Films in this Collection
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {collection.parts.map((part, i) => {
            const full = partContent[part.contentId]
            return (
              <Link
                key={part.contentId}
                to={`/movie/${part.contentId}`}
                className="flex gap-4 p-4 rounded-[var(--radius-xl)] bg-[var(--bg-card)]
                  border border-[var(--border-light)] hover:border-[var(--border)]
                  hover:shadow-[var(--shadow-lg)] transition-all group"
              >
                {/* Order badge */}
                <div className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center
                  text-xs font-bold border border-[var(--border)] text-[var(--text-muted)]
                  bg-[var(--bg-surface)] mt-1">
                  {i + 1}
                </div>

                {/* Poster */}
                <div className="flex-shrink-0 w-16 rounded-[var(--radius-lg)] overflow-hidden
                  border border-[var(--border)]" style={{ aspectRatio: '2/3' }}>
                  {part.posterPath ? (
                    <img
                      src={part.posterPath}
                      alt={part.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-[var(--bg-surface)] flex items-center justify-center">
                      <Film size={16} className="text-[var(--text-muted)]" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-1">
                  <h3 className="font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)]
                    transition-colors leading-snug mb-1">
                    {part.title}
                  </h3>
                  <div className="flex items-center gap-3 mb-2">
                    {part.year && (
                      <span className="text-xs text-[var(--text-muted)]">{part.year}</span>
                    )}
                    {part.rating && <StarRating rating={part.rating} />}
                  </div>
                  {full?.overview && (
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2 leading-relaxed">
                      {full.overview}
                    </p>
                  )}
                  {full?.runtime && (
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      {formatRuntime(full.runtime)}
                    </p>
                  )}
                </div>

                <ChevronRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--accent)]
                  transition-colors self-center flex-shrink-0" />
              </Link>
            )
          })}
        </div>
      </div>
    </main>
  )
}
