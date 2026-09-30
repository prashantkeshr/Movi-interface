import { useState, useRef, useCallback, useEffect } from 'react'
import { Search, X, Clock, TrendingUp } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { SearchIndexEntry } from '@/types'
import { getSuggestions } from '@/services/searchEngine'
import { usePreferences } from '@/hooks/usePreferences'

interface SearchBarProps {
  size?: 'default' | 'hero' | 'compact'
  placeholder?: string
  autoFocus?: boolean
  onSearch?: (query: string) => void
  initialValue?: string
}

function SearchSuggestion({ item, onClick }: { item: SearchIndexEntry; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5
        hover:bg-[var(--bg-card-hover)] transition-colors text-left"
    >
      <div className="w-8 h-8 rounded flex-shrink-0 overflow-hidden bg-[var(--bg-card)]
        border border-[var(--border-light)]">
        {item.posterPath ? (
          <img src={item.posterPath} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Search size={12} className="text-[var(--text-muted)]" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-[var(--text-primary)] truncate">{item.title}</p>
        <p className="text-xs text-[var(--text-muted)]">
          {item.year && item.year}
          {item.year && item.contentType && ' · '}
          {item.contentType && item.contentType.replace('_', ' ')}
          {item.type === 'person' && 'Person'}
          {item.type === 'provider' && 'Provider'}
        </p>
      </div>
    </button>
  )
}

export function SearchBar({
  size = 'default',
  placeholder = 'Search movies, people, providers...',
  autoFocus,
  onSearch,
  initialValue = '',
}: SearchBarProps) {
  const [query, setQuery] = useState(initialValue)
  const [suggestions, setSuggestions] = useState<SearchIndexEntry[]>([])
  const [focused, setFocused] = useState(false)
  const [selectedIdx, setSelectedIdx] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { prefs, addRecentSearch } = usePreferences()

  const showDropdown = focused && (suggestions.length > 0 || (query.length === 0 && prefs.recentSearches.length > 0))

  const handleChange = useCallback((value: string) => {
    setQuery(value)
    setSelectedIdx(-1)
    if (value.trim().length >= 2) {
      setSuggestions(getSuggestions(value))
    } else {
      setSuggestions([])
    }
  }, [])

  const handleSubmit = useCallback((q: string) => {
    if (!q.trim()) return
    addRecentSearch(q.trim())
    setSuggestions([])
    setFocused(false)
    if (onSearch) {
      onSearch(q.trim())
    } else {
      navigate(`/search?q=${encodeURIComponent(q.trim())}`)
    }
  }, [addRecentSearch, navigate, onSearch])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIdx((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIdx((i) => Math.max(i - 1, -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIdx >= 0 && suggestions[selectedIdx]) {
        const s = suggestions[selectedIdx]
        if (s.type === 'content') navigate(`/movie/${s.id}`)
        else if (s.type === 'person') navigate(`/person/${s.id}`)
        else if (s.type === 'provider') navigate(`/provider/${s.id}`)
      } else {
        handleSubmit(query)
      }
    } else if (e.key === 'Escape') {
      setFocused(false)
      setSuggestions([])
      inputRef.current?.blur()
    }
  }

  useEffect(() => {
    if (initialValue !== query) setQuery(initialValue)
  }, [initialValue])

  const heightClass = size === 'hero' ? 'h-14 sm:h-16' : size === 'compact' ? 'h-9' : 'h-11'
  const textClass = size === 'hero' ? 'text-base sm:text-lg' : size === 'compact' ? 'text-sm' : 'text-sm'
  const iconSize = size === 'hero' ? 20 : 16

  return (
    <div className="relative w-full">
      <div
        className={`relative flex items-center ${heightClass}
          bg-[var(--bg-surface)] border transition-all duration-200
          rounded-[var(--radius-xl)] overflow-visible
          ${focused
            ? 'border-[var(--accent)] shadow-[0_0_0_3px_var(--accent-glow)]'
            : 'border-[var(--border)] hover:border-[var(--border)]'
          }`}
      >
        <Search
          size={iconSize}
          className="absolute left-4 text-[var(--text-muted)] pointer-events-none flex-shrink-0"
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 150)}
          placeholder={placeholder}
          autoFocus={autoFocus}
          className={`w-full h-full bg-transparent ${textClass}
            text-[var(--text-primary)] placeholder-[var(--text-muted)]
            pl-11 pr-${query ? '10' : '4'} focus:outline-none`}
          aria-label="Search"
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setSuggestions([]); inputRef.current?.focus() }}
            className="absolute right-3 p-1.5 text-[var(--text-muted)]
              hover:text-[var(--text-primary)] transition-colors rounded-full
              hover:bg-[var(--bg-card)]"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 mt-2 z-50
            bg-[var(--bg-modal)] border border-[var(--border)]
            rounded-[var(--radius-lg)] shadow-[var(--shadow-xl)]
            overflow-hidden max-h-[400px] overflow-y-auto"
          role="listbox"
        >
          {query.length < 2 && prefs.recentSearches.length > 0 && (
            <>
              <div className="flex items-center gap-2 px-4 py-2 text-xs
                text-[var(--text-muted)] border-b border-[var(--border-light)]">
                <Clock size={12} /> Recent searches
              </div>
              {prefs.recentSearches.slice(0, 5).map((s) => (
                <button
                  key={s}
                  onClick={() => handleSubmit(s)}
                  className="w-full flex items-center gap-3 px-4 py-2.5
                    hover:bg-[var(--bg-card-hover)] transition-colors text-left"
                >
                  <Clock size={14} className="text-[var(--text-muted)] flex-shrink-0" />
                  <span className="text-sm text-[var(--text-secondary)]">{s}</span>
                </button>
              ))}
            </>
          )}

          {suggestions.length > 0 && (
            <>
              <div className="flex items-center gap-2 px-4 py-2 text-xs
                text-[var(--text-muted)] border-b border-[var(--border-light)]">
                <TrendingUp size={12} /> Suggestions
              </div>
              {suggestions.map((item, i) => (
                <div
                  key={item.id}
                  className={i === selectedIdx ? 'bg-[var(--bg-card-hover)]' : ''}
                >
                  <SearchSuggestion
                    item={item}
                    onClick={() => {
                      if (item.type === 'content') navigate(`/movie/${item.id}`)
                      else if (item.type === 'person') navigate(`/person/${item.id}`)
                      else navigate(`/provider/${item.id}`)
                    }}
                  />
                </div>
              ))}
              {query.trim() && (
                <button
                  onClick={() => handleSubmit(query)}
                  className="w-full flex items-center gap-3 px-4 py-3
                    border-t border-[var(--border-light)]
                    hover:bg-[var(--bg-card-hover)] transition-colors text-left"
                >
                  <Search size={14} className="text-[var(--accent)] flex-shrink-0" />
                  <span className="text-sm text-[var(--accent)] font-medium">
                    Search for "{query}"
                  </span>
                </button>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
