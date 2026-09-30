import type { SearchIndexEntry, Content } from '@/types'

export interface CollectionPart {
  contentId: string
  title: string
  year?: number
  order: number
  posterPath?: string
  rating?: number
}

export interface CollectionData {
  id: string
  name: string
  slug?: string
  tagline?: string
  description?: string
  heroContentId?: string
  color?: string
  tags?: string[]
  curator?: string
  contentCount: number
  averageRating?: number
  totalRuntime?: number
  parts: CollectionPart[]
}

export interface CollectionSummary {
  id: string
  name: string
  slug?: string
  tagline?: string
  description?: string
  color?: string
  contentCount: number
  averageRating?: number
  totalRuntime?: number
  tags?: string[]
  featuredPosterPath?: string
}

// Returns collection IDs the given contentId belongs to
export function getContentCollections(
  contentId: string,
  collections: CollectionData[]
): CollectionData[] {
  return collections.filter((c) => c.parts.some((p) => p.contentId === contentId))
}

// Multi-signal related content scoring
export function getRelatedContent(
  current: Content | SearchIndexEntry,
  allEntries: SearchIndexEntry[],
  collections: CollectionData[],
  limit = 8
): SearchIndexEntry[] {
  const currentId = current.id
  const currentGenres: string[] = 'genres' in current ? (current.genres ?? []) : []
  const currentType = 'type' in current
    ? (current as Content).type
    : (current as SearchIndexEntry).contentType ?? 'movie'

  const memberCollectionIds = new Set(
    collections
      .filter((c) => c.parts.some((p) => p.contentId === currentId))
      .map((c) => c.id)
  )

  // Build a set of contentIds that share a collection with current
  const sameCollectionIds = new Set<string>()
  for (const col of collections) {
    if (memberCollectionIds.has(col.id)) {
      for (const part of col.parts) {
        if (part.contentId !== currentId) sameCollectionIds.add(part.contentId)
      }
    }
  }

  const scored = allEntries
    .filter((e) => e.type === 'content' && e.id !== currentId)
    .map((e) => {
      let score = 0

      if (sameCollectionIds.has(e.id)) score += 5

      const genreMatches = currentGenres.filter((g) => e.genres?.includes(g)).length
      score += genreMatches * 2

      if ((currentType as string) === (e.contentType ?? '')) score += 1

      if ((e.rating ?? 0) >= 9.0) score += 1.5
      else if ((e.rating ?? 0) >= 8.5) score += 1
      else if ((e.rating ?? 0) >= 8.0) score += 0.5

      score += ((e.popularity ?? 0) / 100) * 0.5

      return { entry: e, score }
    })

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((r) => r.entry)
}

export function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}
