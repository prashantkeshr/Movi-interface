// ─── Content Types ───────────────────────────────────────────────────────────

export type ContentType =
  | 'movie'
  | 'short_film'
  | 'documentary'
  | 'animation'
  | 'anime_film'
  | 'concert_film'
  | 'tv_movie'
  | 'special'
  | 'anthology'

export type AvailabilityType =
  | 'streaming'
  | 'subscription'
  | 'free'
  | 'ad_supported'
  | 'rent'
  | 'buy'
  | 'tv'
  | 'broadcast'
  | 'physical'
  | 'other'

export type AvailabilityStatus =
  | 'confirmed'
  | 'recently_verified'
  | 'unverified'
  | 'historical'
  | 'expired'
  | 'coming_soon'
  | 'unavailable'

// ─── Content ─────────────────────────────────────────────────────────────────

export interface LocalizedTitle {
  language: string
  title: string
  script?: string
}

export interface ExternalIdentifier {
  source: 'imdb' | 'tmdb' | 'wikidata' | string
  id: string
  url?: string
}

export interface ContentVersion {
  id: string
  name: string
  type: 'theatrical' | 'extended' | 'directors_cut' | 'remaster' | 'restoration' | 'regional' | 'other'
  runtime?: number
  notes?: string
}

export interface ReleaseDate {
  market: string
  date: string
  type: 'theatrical' | 'streaming' | 'digital' | 'physical' | 'broadcast'
}

export interface Ratings {
  source: string
  value: string | number
  scale?: number
  count?: number
}

export interface Certification {
  market: string
  rating: string
  description?: string
}

export interface ContentSummary {
  id: string
  type: ContentType
  title: string
  originalTitle?: string
  year: number
  runtime?: number
  genres: string[]
  languages: string[]
  countries: string[]
  posterPath?: string
  backdropPath?: string
  overview: string
  rating?: number
  popularity?: number
}

export interface Content extends ContentSummary {
  tagline?: string
  alternativeTitles?: string[]
  localizedTitles?: LocalizedTitle[]
  releaseDates?: ReleaseDate[]
  keywords?: string[]
  productionCompanies?: string[]
  distributors?: string[]
  directors?: string[]
  writers?: string[]
  cast?: CastMember[]
  franchise?: string
  collections?: string[]
  versions?: ContentVersion[]
  trailers?: Trailer[]
  ratings?: Ratings[]
  certifications?: Certification[]
  externalIds?: ExternalIdentifier[]
  availabilitySummary?: Record<string, AvailabilityEntry[]>
  sources?: DataSource[]
  lastUpdated?: string
}

export interface CastMember {
  personId: string
  name: string
  character?: string
  order?: number
  profilePath?: string
}

// ─── Trailer ─────────────────────────────────────────────────────────────────

export interface Trailer {
  id: string
  contentId: string
  name: string
  type: 'teaser' | 'trailer' | 'final_trailer' | 'international' | 'featurette' | 'clip' | 'other'
  language: string
  site: 'youtube' | 'vimeo' | 'other'
  key: string
  official: boolean
  publishedAt?: string
}

// ─── Person ───────────────────────────────────────────────────────────────────

export interface Person {
  id: string
  name: string
  aliases?: string[]
  biography?: string
  birthday?: string
  birthplace?: string
  profilePath?: string
  knownFor?: string[]
  roles?: PersonRole[]
  externalIds?: ExternalIdentifier[]
  sources?: DataSource[]
  lastUpdated?: string
}

export interface PersonRole {
  contentId: string
  contentTitle: string
  role: 'director' | 'writer' | 'actor' | 'producer' | 'composer' | 'cinematographer' | 'editor' | 'other'
  character?: string
  year?: number
}

// ─── Provider ────────────────────────────────────────────────────────────────

export type ProviderType =
  | 'streaming'
  | 'tv_network'
  | 'digital_store'
  | 'rental'
  | 'broadcaster'
  | 'fast'
  | 'physical'

export interface Provider {
  id: string
  name: string
  type: ProviderType
  logoPath?: string
  website?: string
  officialUrl?: string
  affiliateUrl?: string
  markets?: string[]
  availabilityCategories?: AvailabilityType[]
  description?: string
  sources?: DataSource[]
  lastUpdated?: string
}

// ─── Market ───────────────────────────────────────────────────────────────────

export interface Market {
  id: string
  name: string
  isoCode: string
  region: string
  continent: string
  languages: string[]
  currency?: string
  timezone?: string
  aliases?: string[]
}

// ─── Availability ─────────────────────────────────────────────────────────────

export interface AvailabilityEntry {
  id: string
  contentId: string
  versionId?: string
  market: string
  providerId: string
  providerName: string
  providerLogo?: string
  type: AvailabilityType
  audioLanguages?: string[]
  subtitleLanguages?: string[]
  resolution?: '4k' | 'hd' | 'sd'
  availableFrom?: string
  availableUntil?: string
  officialUrl?: string
  affiliateUrl?: string
  price?: number
  currency?: string
  status: AvailabilityStatus
  lastVerified?: string
  confidence?: 'high' | 'medium' | 'low'
  notes?: string
}

// ─── Search ───────────────────────────────────────────────────────────────────

export interface SearchIndexEntry {
  id: string
  type: 'content' | 'person' | 'provider' | 'franchise'
  title: string
  normalizedTitle: string
  aliases?: string[]
  year?: number
  contentType?: ContentType
  posterPath?: string
  genres?: string[]
  rating?: number
  popularity?: number
}

export interface SearchResult {
  item: SearchIndexEntry
  score: number
  type: 'content' | 'person' | 'provider' | 'franchise'
}

// ─── Manifest ────────────────────────────────────────────────────────────────

export interface DataManifest {
  version: string
  schemaVersion: string
  generatedAt: string
  contentCount: number
  peopleCount: number
  providerCount: number
  marketCount: number
  availabilityCount: number
  datasets: Record<string, DatasetInfo>
  searchIndexes: Record<string, SearchIndexInfo>
  marketPacks: Record<string, MarketPackInfo>
  supportedMarkets: string[]
  supportedLanguages: string[]
  lastContentUpdate: string
  lastAvailabilityUpdate: string
}

export interface DatasetInfo {
  path: string
  size?: number
  count?: number
  lastUpdated: string
  checksum?: string
}

export interface SearchIndexInfo {
  path: string
  type: string
  entryCount: number
  lastUpdated: string
}

export interface MarketPackInfo {
  market: string
  path: string
  contentCount: number
  providerCount: number
  lastUpdated: string
}

// ─── Data Source ──────────────────────────────────────────────────────────────

export interface DataSource {
  id: string
  name: string
  url?: string
  license?: string
  retrievedAt?: string
  lastVerified?: string
  confidence?: 'high' | 'medium' | 'low'
  notes?: string
}

// ─── Franchise / Collection ───────────────────────────────────────────────────

export interface Franchise {
  id: string
  name: string
  description?: string
  posterPath?: string
  backdropPath?: string
  parts?: FranchisePart[]
}

export interface FranchisePart {
  contentId: string
  title: string
  year?: number
  order?: number
  type?: 'main' | 'spinoff' | 'prequel' | 'sequel' | 'remake' | 'adaptation'
}

export interface Collection {
  id: string
  name: string
  description?: string
  posterPath?: string
  parts?: string[]
}

// ─── Genre / Language ─────────────────────────────────────────────────────────

export interface Genre {
  id: string
  name: string
  description?: string
  slug: string
}

export interface Language {
  code: string
  name: string
  nativeName?: string
  script?: string
}

// ─── User Preferences ─────────────────────────────────────────────────────────

export interface UserPreferences {
  market: string
  language: string
  theme: 'light' | 'dark' | 'system'
  performanceMode: 'auto' | 'lite' | 'full'
  recentSearches: string[]
  recentlyViewed: string[]
  watchlist: string[]
  favorites: string[]
}
