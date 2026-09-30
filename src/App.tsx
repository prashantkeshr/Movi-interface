import { Suspense, lazy, useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { Skeleton } from '@/components/ui/Skeleton'
import { loadSearchIndex, loadMarkets } from '@/services/dataLoader'
import { initSearchEngine } from '@/services/searchEngine'
import type { Market } from '@/types'

const HomePage = lazy(() => import('@/pages/Home').then((m) => ({ default: m.HomePage })))
const SearchPage = lazy(() => import('@/pages/Search').then((m) => ({ default: m.SearchPage })))
const MoviePage = lazy(() => import('@/pages/Movie').then((m) => ({ default: m.MoviePage })))
const DiscoverPage = lazy(() => import('@/pages/Discover').then((m) => ({ default: m.DiscoverPage })))
const DevelopersPage = lazy(() => import('@/pages/Developers').then((m) => ({ default: m.DevelopersPage })))

function PageLoader() {
  return (
    <main className="pt-20 min-h-screen">
      <div className="container py-8 space-y-4">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-4 w-2/3" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <Skeleton className="w-full aspect-[2/3] rounded-[var(--radius-lg)]" />
              <Skeleton className="h-4 mt-2 w-3/4 rounded" />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

function NotFoundPage() {
  return (
    <main className="pt-20 min-h-screen flex items-center justify-center">
      <div className="text-center px-4">
        <p className="text-6xl font-bold text-[var(--accent)] mb-4">404</p>
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Page not found</h1>
        <p className="text-[var(--text-muted)] mb-6">This page doesn't exist in the registry.</p>
        <a href="/" className="text-[var(--accent)] hover:underline">← Back to home</a>
      </div>
    </main>
  )
}

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function AppShell() {
  const [markets, setMarkets] = useState<Market[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    Promise.all([loadSearchIndex(), loadMarkets()])
      .then(([index, mks]) => {
        initSearchEngine(index)
        setMarkets(mks)
        setReady(true)
      })
      .catch((e) => {
        console.error('Failed to initialize data:', e)
        initSearchEngine([])
        setReady(true)
      })
  }, [])

  if (!ready) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[var(--bg-base)]">
        <div className="text-center">
          <div className="w-10 h-10 rounded-[10px] bg-[var(--accent)] flex items-center justify-center
            mx-auto mb-4 animate-pulse">
            <span className="text-[#080c14] font-bold text-lg">M</span>
          </div>
          <p className="text-[var(--text-muted)] text-sm">Loading MOVI...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <ScrollToTop />
      <Header markets={markets} />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/discover" element={<DiscoverPage />} />
          <Route path="/movie/:id" element={<MoviePage />} />
          <Route path="/developers" element={<DevelopersPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
      <Footer />
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}
