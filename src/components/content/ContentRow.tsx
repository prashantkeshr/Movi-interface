import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { SearchIndexEntry } from '@/types'
import { ContentCard } from './ContentCard'
import { ContentCardSkeleton } from '@/components/ui/Skeleton'

interface ContentRowProps {
  title: string
  subtitle?: string
  items: SearchIndexEntry[]
  loading?: boolean
  seeAllHref?: string
  providerMap?: Record<string, string[]>
  cardSize?: 'sm' | 'md' | 'lg'
}

export function ContentRow({
  title,
  subtitle,
  items,
  loading,
  seeAllHref,
  providerMap,
  cardSize = 'md',
}: ContentRowProps) {
  return (
    <section>
      <div className="flex items-end justify-between mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold text-[var(--text-primary)]">{title}</h2>
          {subtitle && (
            <p className="text-sm text-[var(--text-muted)] mt-0.5">{subtitle}</p>
          )}
        </div>
        {seeAllHref && (
          <Link
            to={seeAllHref}
            className="flex items-center gap-1 text-sm text-[var(--accent)] hover:text-[var(--accent-dim)]
              transition-colors font-medium"
          >
            See all <ChevronRight size={14} />
          </Link>
        )}
      </div>

      <div className="scroll-row">
        {loading
          ? Array.from({ length: 8 }).map((_, i) => (
              <div key={i} style={{ width: cardSize === 'sm' ? 150 : cardSize === 'lg' ? 240 : 195 }}>
                <ContentCardSkeleton />
              </div>
            ))
          : items.map((item) => (
              <ContentCard
                key={item.id}
                item={item}
                availability={providerMap?.[item.id]}
                size={cardSize}
              />
            ))}
      </div>
    </section>
  )
}
