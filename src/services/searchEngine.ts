import Fuse, { type IFuseOptions } from 'fuse.js'
import type { SearchIndexEntry, SearchResult } from '@/types'

let fuse: Fuse<SearchIndexEntry> | null = null
let indexData: SearchIndexEntry[] = []

const FUSE_OPTIONS: IFuseOptions<SearchIndexEntry> = {
  keys: [
    { name: 'title', weight: 2 },
    { name: 'normalizedTitle', weight: 1.8 },
    { name: 'aliases', weight: 1.5 },
    { name: 'keywords', weight: 0.8 },
  ],
  threshold: 0.45,
  includeScore: true,
  minMatchCharLength: 2,
  shouldSort: true,
  findAllMatches: false,
  ignoreLocation: true,
}

export function initSearchEngine(data: SearchIndexEntry[]) {
  indexData = data
  fuse = new Fuse(data, FUSE_OPTIONS)
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

interface ParsedQuery {
  q: string
  genres: string[]
  providers: string[]
  languages: string[]
  types: string[]
  markets: string[]
}

const GENRE_MAP: Record<string, string> = {
  action: 'Action', drama: 'Drama', comedy: 'Comedy', horror: 'Horror',
  romance: 'Romance', thriller: 'Thriller', documentary: 'Documentary',
  animation: 'Animation', anime: 'Animation', scifi: 'Science Fiction',
  'sci-fi': 'Science Fiction', 'science fiction': 'Science Fiction',
  adventure: 'Adventure', fantasy: 'Fantasy', biography: 'Biography',
  biopic: 'Biography', sport: 'Sport', sports: 'Sport', history: 'History',
  crime: 'Crime', mystery: 'Mystery', family: 'Family',
}

const PROVIDER_MAP: Record<string, string> = {
  netflix: 'Netflix', prime: 'Prime Video', amazon: 'Prime Video',
  hotstar: 'Disney+ Hotstar', 'disney+': 'Disney+ Hotstar', disney: 'Disney+ Hotstar',
  apple: 'Apple TV+', mubi: 'MUBI', youtube: 'YouTube Movies',
  jio: 'JioCinema', zee5: 'ZEE5',
}

const LANGUAGE_MAP: Record<string, string> = {
  hindi: 'hi', english: 'en', telugu: 'te', tamil: 'ta',
  malayalam: 'ml', kannada: 'kn', bengali: 'bn', marathi: 'mr',
  japanese: 'ja', korean: 'ko', french: 'fr', german: 'de',
  spanish: 'es',
}

const TYPE_MAP: Record<string, string> = {
  movie: 'movie', film: 'movie', documentary: 'documentary',
  docufilm: 'documentary', animated: 'animation', anime: 'anime_film',
  animation: 'animation', short: 'short_film',
}

const MARKET_MAP: Record<string, string> = {
  india: 'IN', 'in': 'IN', us: 'US', usa: 'US', america: 'US',
  uk: 'GB', britain: 'GB', england: 'GB', japan: 'JP', korea: 'KR',
  australia: 'AU',
}

export function parseQuery(raw: string): ParsedQuery {
  const lower = raw.toLowerCase()
  const result: ParsedQuery = { q: raw, genres: [], providers: [], languages: [], types: [], markets: [] }

  for (const [key, val] of Object.entries(GENRE_MAP)) {
    if (lower.includes(key)) result.genres.push(val)
  }
  for (const [key, val] of Object.entries(PROVIDER_MAP)) {
    if (lower.includes(key)) result.providers.push(val)
  }
  for (const [key, val] of Object.entries(LANGUAGE_MAP)) {
    if (lower.includes(key)) result.languages.push(val)
  }
  for (const [key, val] of Object.entries(TYPE_MAP)) {
    if (lower.includes(key)) result.types.push(val)
  }
  for (const [key, val] of Object.entries(MARKET_MAP)) {
    if (lower.includes(` ${key}`) || lower.startsWith(key + ' ') || lower === key) {
      result.markets.push(val)
    }
  }

  const hasFilters =
    result.genres.length > 0 ||
    result.providers.length > 0 ||
    result.languages.length > 0 ||
    result.types.length > 0 ||
    result.markets.length > 0

  if (hasFilters) {
    let cleaned = lower
    ;[...Object.keys(GENRE_MAP), ...Object.keys(PROVIDER_MAP),
      ...Object.keys(LANGUAGE_MAP), ...Object.keys(TYPE_MAP),
      ...Object.keys(MARKET_MAP), 'movies', 'films', 'on', 'in', 'with', 'the', 'a', 'an',
      'available', 'watch', 'streaming',
    ].forEach((kw) => { cleaned = cleaned.replace(new RegExp(`\\b${kw}\\b`, 'gi'), '') })
    result.q = cleaned.trim()
  }

  return result
}

export function search(
  query: string,
  filter?: {
    types?: string[]
    genres?: string[]
    languages?: string[]
    providers?: string[]
    market?: string
    availabilityMap?: Record<string, string[]>
  }
): SearchResult[] {
  if (!fuse || !query.trim()) return []

  const parsed = parseQuery(query)
  const effectiveQ = parsed.q || query

  let results: SearchResult[] = []

  if (effectiveQ.length >= 2) {
    const raw = fuse.search(normalize(effectiveQ))
    results = raw.map((r) => ({
      item: r.item,
      score: 1 - (r.score ?? 0),
      type: r.item.type,
    }))
  }

  const genres = [...(parsed.genres), ...(filter?.genres ?? [])]
  const types = [...(parsed.types), ...(filter?.types ?? [])]
  const languages = [...(parsed.languages), ...(filter?.languages ?? [])]
  const providers = [...(parsed.providers), ...(filter?.providers ?? [])]

  if (genres.length > 0 || types.length > 0 || languages.length > 0 || providers.length > 0) {
    results = results.filter((r) => {
      if (types.length > 0 && r.item.contentType && !types.includes(r.item.contentType)) return false
      if (genres.length > 0 && r.item.genres) {
        const hasGenre = genres.some((g) => r.item.genres?.includes(g))
        if (!hasGenre) return false
      }
      return true
    })
  }

  if (results.length === 0 && (genres.length > 0 || types.length > 0)) {
    results = indexData
      .filter((item) => {
        if (item.type !== 'content') return false
        if (types.length > 0 && item.contentType && !types.includes(item.contentType)) return false
        if (genres.length > 0 && item.genres) {
          return genres.some((g) => item.genres?.includes(g))
        }
        return true
      })
      .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
      .slice(0, 20)
      .map((item) => ({ item, score: 0.5, type: item.type }))
  }

  return results.slice(0, 30)
}

export function getTopContent(limit = 12): SearchIndexEntry[] {
  return [...indexData]
    .filter((e) => e.type === 'content')
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
    .slice(0, limit)
}

export function getFeaturedContent(limit = 5): SearchIndexEntry[] {
  return [...indexData]
    .filter((e) => e.type === 'content')
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, limit)
}

export function getByGenre(genre: string, limit = 8): SearchIndexEntry[] {
  return [...indexData]
    .filter((e) => e.type === 'content' && e.genres?.includes(genre))
    .sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0))
    .slice(0, limit)
}

export function getSuggestions(query: string): SearchIndexEntry[] {
  if (!fuse || query.length < 2) return []
  return fuse.search(normalize(query), { limit: 6 }).map((r) => r.item)
}
