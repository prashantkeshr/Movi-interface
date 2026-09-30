import { useState, useEffect } from 'react'
import type { UserPreferences } from '@/types'

const KEY = 'movi_prefs'

const DEFAULTS: UserPreferences = {
  market: 'IN',
  language: 'en',
  theme: 'dark',
  performanceMode: 'auto',
  recentSearches: [],
  recentlyViewed: [],
  watchlist: [],
  favorites: [],
}

function load(): UserPreferences {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return DEFAULTS
    return { ...DEFAULTS, ...JSON.parse(raw) as Partial<UserPreferences> }
  } catch {
    return DEFAULTS
  }
}

function save(prefs: UserPreferences) {
  try {
    localStorage.setItem(KEY, JSON.stringify(prefs))
  } catch { /* ignore */ }
}

export function usePreferences() {
  const [prefs, setPrefsState] = useState<UserPreferences>(load)

  const setPrefs = (update: Partial<UserPreferences>) => {
    setPrefsState((prev) => {
      const next = { ...prev, ...update }
      save(next)
      return next
    })
  }

  const addRecentSearch = (query: string) => {
    if (!query.trim()) return
    setPrefs({
      recentSearches: [query, ...prefs.recentSearches.filter((s) => s !== query)].slice(0, 10),
    })
  }

  const addRecentlyViewed = (id: string) => {
    setPrefs({
      recentlyViewed: [id, ...prefs.recentlyViewed.filter((i) => i !== id)].slice(0, 20),
    })
  }

  const toggleWatchlist = (id: string) => {
    const inList = prefs.watchlist.includes(id)
    setPrefs({
      watchlist: inList ? prefs.watchlist.filter((i) => i !== id) : [...prefs.watchlist, id],
    })
  }

  const toggleFavorite = (id: string) => {
    const inList = prefs.favorites.includes(id)
    setPrefs({
      favorites: inList ? prefs.favorites.filter((i) => i !== id) : [...prefs.favorites, id],
    })
  }

  useEffect(() => {
    const root = document.documentElement
    const theme = prefs.theme === 'system'
      ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : prefs.theme
    root.setAttribute('data-theme', theme)
  }, [prefs.theme])

  return {
    prefs,
    setPrefs,
    addRecentSearch,
    addRecentlyViewed,
    toggleWatchlist,
    toggleFavorite,
  }
}
