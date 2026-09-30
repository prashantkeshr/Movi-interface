interface SkeletonProps {
  className?: string
  style?: React.CSSProperties
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return <div className={`skeleton ${className}`} style={style} />
}

export function ContentCardSkeleton() {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton className="w-full aspect-[2/3] rounded-[var(--radius-lg)]" />
      <Skeleton className="h-4 w-3/4 rounded" />
      <Skeleton className="h-3 w-1/2 rounded" />
    </div>
  )
}

export function HeroSkeleton() {
  return (
    <div className="relative w-full h-[70vh] min-h-[500px]">
      <Skeleton className="absolute inset-0 rounded-none" />
    </div>
  )
}
