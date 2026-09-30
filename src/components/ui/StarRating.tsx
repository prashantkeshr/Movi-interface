import { Star } from 'lucide-react'

interface StarRatingProps {
  rating: number
  scale?: number
  showValue?: boolean
  size?: number
}

export function StarRating({ rating, scale = 10, showValue = true, size = 14 }: StarRatingProps) {
  const pct = rating / scale
  const stars = Math.round(pct * 5)

  return (
    <span className="inline-flex items-center gap-1.5">
      <Star
        size={size}
        className="fill-[var(--accent)] text-[var(--accent)]"
        strokeWidth={0}
      />
      {showValue && (
        <span className="text-[var(--accent)] font-semibold tabular-nums" style={{ fontSize: size }}>
          {rating.toFixed(1)}
        </span>
      )}
    </span>
  )
}
