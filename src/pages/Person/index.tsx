import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Film, User, ExternalLink, ChevronRight } from 'lucide-react'
import type { Person, SearchIndexEntry } from '@/types'
import { loadPerson } from '@/services/dataLoader'
import { getTopContent } from '@/services/searchEngine'
import { StarRating } from '@/components/ui/StarRating'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'

const ROLE_LABEL: Record<string, string> = {
  director: 'Director',
  writer: 'Writer',
  actor: 'Actor',
  producer: 'Producer',
  composer: 'Composer',
  cinematographer: 'Cinematographer',
  editor: 'Editor',
  other: 'Crew',
}

export function PersonPage() {
  const { id } = useParams<{ id: string }>()
  const [person, setPerson] = useState<Person | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const allContent = getTopContent(100)
  const contentMap = Object.fromEntries(allContent.map((e) => [e.id, e]))

  useEffect(() => {
    if (!id) return
    setLoading(true)
    loadPerson(id)
      .then(setPerson)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <main className="pt-20 min-h-screen">
        <div className="container py-10">
          <div className="flex gap-6 mb-10">
            <Skeleton className="w-24 h-24 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-full max-w-lg" />
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-full aspect-[2/3] rounded-[var(--radius-lg)]" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (notFound || !person) {
    return (
      <main className="pt-20 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User size={40} className="mx-auto mb-4 text-[var(--text-muted)]" />
          <h1 className="text-xl font-semibold text-[var(--text-primary)] mb-2">Person not found</h1>
          <Link to="/discover" className="text-[var(--accent)] hover:underline text-sm">← Back to Discover</Link>
        </div>
      </main>
    )
  }

  const initials = person.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
  const imdbId = person.externalIds?.find((e) => e.source === 'imdb')
  const filmography = person.roles ?? []
  const uniqueRoles = [...new Set(person.knownFor ?? [])]

  return (
    <main className="pt-20 pb-16 min-h-screen">
      <div className="container">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-8">
          <Link to="/" className="hover:text-[var(--text-primary)] transition-colors">Home</Link>
          <ChevronRight size={11} />
          <span className="text-[var(--text-primary)] truncate">{person.name}</span>
        </nav>

        {/* Header */}
        <div className="flex gap-5 sm:gap-8 mb-10">
          <div className="flex-shrink-0 w-20 h-20 sm:w-28 sm:h-28 rounded-full
            bg-gradient-to-br from-[var(--accent)]/30 to-[var(--accent)]/10
            border-2 border-[var(--accent)]/30 flex items-center justify-center">
            <span className="text-2xl sm:text-3xl font-bold text-[var(--accent)]">{initials}</span>
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--text-primary)] mb-1">
              {person.name}
            </h1>

            {/* Known for roles */}
            {uniqueRoles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {uniqueRoles.map((role) => (
                  <Badge key={role} variant="accent" size="sm">{ROLE_LABEL[role] ?? role}</Badge>
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
              {person.birthday && (
                <span className="text-sm text-[var(--text-muted)]">
                  b. {person.birthday.split('-')[0]}
                </span>
              )}
              {person.birthplace && (
                <span className="text-sm text-[var(--text-muted)]">
                  {person.birthplace}
                </span>
              )}
              {imdbId && (
                <a
                  href={imdbId.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs text-[var(--accent)]
                    hover:text-[var(--accent-dim)] transition-colors"
                >
                  IMDb <ExternalLink size={10} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Biography */}
        {person.biography && (
          <div className="max-w-3xl mb-12">
            <h2 className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">
              Biography
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed text-sm">
              {person.biography}
            </p>
          </div>
        )}

        {/* Filmography */}
        {filmography.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-5">
              Filmography in Registry
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filmography.map((role) => {
                const entry = contentMap[role.contentId] as SearchIndexEntry | undefined
                return (
                  <Link
                    key={`${role.contentId}-${role.role}`}
                    to={`/movie/${role.contentId}`}
                    className="group rounded-[var(--radius-xl)] overflow-hidden
                      bg-[var(--bg-card)] border border-[var(--border-light)]
                      hover:border-[var(--accent)]/40 transition-all"
                  >
                    {/* Poster */}
                    <div className="relative" style={{ aspectRatio: '2/3' }}>
                      {entry?.posterPath ? (
                        <img
                          src={entry.posterPath}
                          alt={role.contentTitle}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[var(--bg-surface)] flex items-center justify-center">
                          <Film size={24} className="text-[var(--text-muted)]" />
                        </div>
                      )}
                      {/* Role badge */}
                      <div className="absolute top-2 left-2">
                        <span className="text-[10px] font-semibold px-1.5 py-0.5
                          rounded-[3px] bg-black/70 text-white/80 backdrop-blur-sm">
                          {ROLE_LABEL[role.role] ?? role.role}
                        </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-3">
                      <p className="text-sm font-semibold text-[var(--text-primary)]
                        group-hover:text-[var(--accent)] transition-colors leading-snug truncate">
                        {role.contentTitle}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-[var(--text-muted)]">{role.year}</span>
                        {entry?.rating && <StarRating rating={entry.rating} />}
                      </div>
                      {role.character && (
                        <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                          as {role.character}
                        </p>
                      )}
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
