import { useState } from 'react'
import { Code, Database, FileJson, Globe, Zap, ChevronRight, Copy, Check } from 'lucide-react'

const ENDPOINTS = [
  { method: 'GET', path: '/data/manifest.json', desc: 'Registry manifest with counts and dataset info' },
  { method: 'GET', path: '/data/v1/search/index.json', desc: 'Unified search index for all entities' },
  { method: 'GET', path: '/data/v1/content/{id}.json', desc: 'Full content record by ID' },
  { method: 'GET', path: '/data/v1/people/{id}.json', desc: 'Person record by ID' },
  { method: 'GET', path: '/data/v1/providers/index.json', desc: 'All streaming providers' },
  { method: 'GET', path: '/data/v1/markets/index.json', desc: 'All supported markets' },
  { method: 'GET', path: '/data/v1/availability/{market}.json', desc: 'Availability pack by market code (IN, US, GB...)' },
]

const SAMPLE_CONTENT = `{
  "id": "content_001",
  "type": "movie",
  "title": "Inception",
  "year": 2010,
  "runtime": 148,
  "genres": ["Action", "Science Fiction"],
  "languages": ["en"],
  "rating": 8.4,
  "directors": ["person_001"],
  "cast": [
    { "personId": "person_002", "name": "Leonardo DiCaprio", "character": "Dom Cobb" }
  ],
  "externalIds": [
    { "source": "imdb", "id": "tt1375666" }
  ]
}`

const SAMPLE_AVAILABILITY = `[
  {
    "id": "avail_001_IN_netflix",
    "contentId": "content_001",
    "market": "IN",
    "providerId": "provider_netflix",
    "providerName": "Netflix",
    "type": "subscription",
    "audioLanguages": ["en", "hi"],
    "resolution": "4k",
    "status": "confirmed",
    "lastVerified": "2026-09-25"
  }
]`

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      onClick={() => {
        navigator.clipboard.writeText(text).catch(() => {})
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }}
      className="p-1.5 rounded text-[var(--text-muted)] hover:text-[var(--text-secondary)]
        hover:bg-[var(--bg-surface)] transition-colors"
      title="Copy"
    >
      {copied ? <Check size={13} className="text-[var(--green)]" /> : <Copy size={13} />}
    </button>
  )
}

export function DevelopersPage() {
  const [activeEndpoint, setActiveEndpoint] = useState(ENDPOINTS[2])
  const [response, setResponse] = useState('')
  const [loading, setLoading] = useState(false)

  const tryEndpoint = async (path: string) => {
    setLoading(true)
    setResponse('')
    const url = path.replace('{id}', 'content_001').replace('{market}', 'IN')
    try {
      const res = await fetch(url)
      const data = await res.json() as unknown
      setResponse(JSON.stringify(data, null, 2))
    } catch (e) {
      setResponse(`// Error fetching ${url}\n// ${e}`)
    }
    setLoading(false)
  }

  return (
    <main className="pt-20 pb-16 min-h-screen">
      <div className="container">
        {/* Header */}
        <div className="py-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4
            bg-[var(--accent-glow)] border border-[var(--accent)]/30
            text-[var(--accent)] text-xs font-semibold">
            <Code size={12} /> Developer Platform
          </div>
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-4">
            Static Data API
          </h1>
          <p className="text-[var(--text-secondary)] text-lg leading-relaxed">
            Every content record, person profile, provider directory and availability pack
            is a publicly accessible static JSON resource. No API key. No rate limits.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { icon: <Zap size={18} />, title: 'Zero Config', desc: 'No API keys, no auth, no setup required' },
            { icon: <Database size={18} />, title: 'Structured Data', desc: 'Versioned JSON with consistent schemas' },
            { icon: <Globe size={18} />, title: 'Global Markets', desc: 'Availability packs per country/territory' },
            { icon: <FileJson size={18} />, title: 'Open Schema', desc: 'Documented JSON schemas for every entity' },
          ].map((f) => (
            <div key={f.title} className="p-5 rounded-[var(--radius-xl)]
              bg-[var(--bg-surface)] border border-[var(--border)]">
              <div className="w-9 h-9 rounded-[var(--radius)] bg-[var(--accent-glow)]
                border border-[var(--accent)]/20 flex items-center justify-center
                text-[var(--accent)] mb-3">
                {f.icon}
              </div>
              <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-1">{f.title}</h3>
              <p className="text-xs text-[var(--text-muted)]">{f.desc}</p>
            </div>
          ))}
        </div>

        {/* Quick start */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Quick Start</h2>
          <div className="bg-[var(--bg-card)] border border-[var(--border)]
            rounded-[var(--radius-xl)] overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[var(--border)] flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--text-muted)]">JavaScript</span>
              <CopyButton text={`// Fetch a content record\nconst res = await fetch('/data/v1/content/content_001.json')\nconst movie = await res.json()\nconsole.log(movie.title) // "Inception"\n\n// Get availability for India\nconst avail = await fetch('/data/v1/availability/IN.json')\nconst inAvailability = await avail.json()\n\n// Load the search index\nconst idx = await fetch('/data/v1/search/index.json')\nconst searchIndex = await idx.json()`} />
            </div>
            <pre className="p-4 text-xs font-mono text-[var(--accent)] overflow-x-auto leading-relaxed">
{`// Fetch a content record
const res = await fetch('/data/v1/content/content_001.json')
const movie = await res.json()
console.log(movie.title) // "Inception"

// Get availability for India
const avail = await fetch('/data/v1/availability/IN.json')
const inAvailability = await avail.json()

// Load the search index
const idx = await fetch('/data/v1/search/index.json')
const searchIndex = await idx.json()`}
            </pre>
          </div>
        </section>

        {/* API Playground */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">API Playground</h2>
          <div className="grid lg:grid-cols-2 gap-4">
            {/* Endpoints */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border)]
              rounded-[var(--radius-xl)] overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border)]">
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                  Endpoints
                </p>
              </div>
              <div className="p-2">
                {ENDPOINTS.map((ep) => (
                  <button
                    key={ep.path}
                    onClick={() => { setActiveEndpoint(ep); tryEndpoint(ep.path) }}
                    className={`w-full text-left p-3 rounded-[var(--radius)] mb-1 transition-colors
                      ${activeEndpoint.path === ep.path
                        ? 'bg-[var(--accent-glow)] border border-[var(--accent)]/30'
                        : 'hover:bg-[var(--bg-card)]'
                      }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded
                        bg-[var(--green)]/15 text-[var(--green)] flex-shrink-0 mt-0.5">
                        {ep.method}
                      </span>
                      <div>
                        <p className="text-xs font-mono text-[var(--text-primary)] leading-tight">
                          {ep.path}
                        </p>
                        <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{ep.desc}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Response */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)]
              rounded-[var(--radius-xl)] overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between">
                <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                  Response
                </p>
                <div className="flex items-center gap-2">
                  {response && <CopyButton text={response} />}
                  <button
                    onClick={() => tryEndpoint(activeEndpoint.path)}
                    disabled={loading}
                    className="text-xs px-2.5 py-1 rounded bg-[var(--accent)] text-[#080c14]
                      font-semibold hover:bg-[var(--accent-dim)] transition-colors
                      disabled:opacity-50"
                  >
                    {loading ? 'Fetching...' : 'Try it →'}
                  </button>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-auto max-h-80">
                {!response && !loading && (
                  <div className="flex flex-col items-center justify-center h-full text-center py-8">
                    <ChevronRight size={24} className="text-[var(--text-muted)] mb-2" />
                    <p className="text-sm text-[var(--text-muted)]">Select an endpoint and click "Try it"</p>
                  </div>
                )}
                {loading && (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-[var(--accent)] border-t-transparent
                      rounded-full animate-spin" />
                  </div>
                )}
                {response && (
                  <pre className="text-[11px] font-mono text-[var(--accent)] whitespace-pre-wrap
                    leading-relaxed break-all">
                    {response.slice(0, 2000)}{response.length > 2000 ? '\n// ... truncated' : ''}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Schema examples */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-4">Schema Examples</h2>
          <div className="grid lg:grid-cols-2 gap-4">
            {[
              { title: 'Content Object', code: SAMPLE_CONTENT },
              { title: 'Availability Entry', code: SAMPLE_AVAILABILITY },
            ].map(({ title, code }) => (
              <div key={title} className="bg-[var(--bg-card)] border border-[var(--border)]
                rounded-[var(--radius-xl)] overflow-hidden">
                <div className="px-4 py-2.5 border-b border-[var(--border)] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[var(--text-secondary)]">{title}</span>
                  <CopyButton text={code} />
                </div>
                <pre className="p-4 text-xs font-mono text-[var(--accent)] overflow-x-auto leading-relaxed">
                  {code}
                </pre>
              </div>
            ))}
          </div>
        </section>

        {/* Disclaimer */}
        <div className="p-5 rounded-[var(--radius-xl)] bg-[var(--bg-surface)] border border-[var(--border)]">
          <p className="text-sm font-semibold text-[var(--text-primary)] mb-2">API Limitations</p>
          <ul className="space-y-1">
            {[
              'This is a static file API — no dynamic queries, no server-side processing',
              'No API keys or authentication in V1',
              'No server-side rate limiting — please be courteous with request frequency',
              'Availability data is dataset-verified, not real-time',
              'Always verify final availability on the provider before subscribing',
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
                <span className="mt-1 text-[var(--accent)] flex-shrink-0">·</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  )
}
