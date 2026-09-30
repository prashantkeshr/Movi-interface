import type {
  DataManifest,
  Content,
  ContentSummary,
  SearchIndexEntry,
  AvailabilityEntry,
  Provider,
  Market,
  Person,
} from '@/types'

const BASE = '/data'
const cache = new Map<string, unknown>()

async function fetchJSON<T>(path: string): Promise<T> {
  if (cache.has(path)) return cache.get(path) as T
  const res = await fetch(path)
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`)
  const data = await res.json() as T
  cache.set(path, data)
  return data
}

export async function loadManifest(): Promise<DataManifest> {
  return fetchJSON<DataManifest>(`${BASE}/manifest.json`)
}

export async function loadSearchIndex(): Promise<SearchIndexEntry[]> {
  return fetchJSON<SearchIndexEntry[]>(`${BASE}/v1/search/index.json`)
}

export async function loadContent(id: string): Promise<Content> {
  return fetchJSON<Content>(`${BASE}/v1/content/${id}.json`)
}

export async function loadProviders(): Promise<Provider[]> {
  return fetchJSON<Provider[]>(`${BASE}/v1/providers/index.json`)
}

export async function loadMarkets(): Promise<Market[]> {
  return fetchJSON<Market[]>(`${BASE}/v1/markets/index.json`)
}

export async function loadAvailability(market: string): Promise<AvailabilityEntry[]> {
  try {
    return await fetchJSON<AvailabilityEntry[]>(`${BASE}/v1/availability/${market}.json`)
  } catch {
    return []
  }
}

export async function loadPerson(id: string): Promise<Person> {
  return fetchJSON<Person>(`${BASE}/v1/people/${id}.json`)
}

export function getAvailabilityForContent(
  availability: AvailabilityEntry[],
  contentId: string
): AvailabilityEntry[] {
  return availability.filter((a) => a.contentId === contentId)
}

export function searchIndexToSummary(entry: SearchIndexEntry): ContentSummary {
  return {
    id: entry.id,
    type: entry.contentType ?? 'movie',
    title: entry.title,
    year: entry.year ?? 0,
    genres: entry.genres ?? [],
    languages: [],
    countries: [],
    posterPath: entry.posterPath,
    overview: '',
    rating: entry.rating,
    popularity: entry.popularity,
  }
}

export function clearCache() {
  cache.clear()
}
