import { useState, useEffect, useRef } from 'react'
import { getOptimizedImageUrl, generateSrcSet, lazyLoadImage } from '../lib/imageOptimizer'

interface OptimizedImageProps {
  src: string | null | undefined
  alt: string
  className?: string
  width?: number
  height?: number
  quality?: number
  loading?: 'lazy' | 'eager'
  placeholder?: string
  onLoad?: () => void
  onError?: () => void
}

/**
 * Optimized image component with lazy loading and responsive images
 */
export function OptimizedImage({
  src,
  alt,
  className = '',
  width,
  height,
  quality = 80,
  loading = 'lazy',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iI2UyZThmMCIvPjwvc3ZnPg==',
  onLoad,
  onError
}: OptimizedImageProps) {
  const [imageSrc, setImageSrc] = useState<string>(placeholder)
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef<HTMLImageElement>(null)

  useEffect(() => {
    if (!src) {
      setHasError(true)
      return
    }

    const optimizedUrl = getOptimizedImageUrl(src, { width, height, quality })

    if (loading === 'lazy' && imgRef.current) {
      // Use lazy loading with intersection observer
      lazyLoadImage(imgRef.current, optimizedUrl)
    } else {
      // Load immediately
      setImageSrc(optimizedUrl)
    }
  }, [src, width, height, quality, loading])

  const handleLoad = () => {
    setIsLoaded(true)
    setHasError(false)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    setIsLoaded(false)
    onError?.()
    // Fallback to original image if optimization fails
    if (src && imageSrc !== src) {
      setImageSrc(src)
    }
  }

  if (hasError && !src) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400">이미지 로드 실패</span>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <img
        ref={imgRef}
        src={imageSrc}
        srcSet={src ? generateSrcSet(src) : undefined}
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        onLoad={handleLoad}
        onError={handleError}
        className={`${className} ${isLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
      />
    </div>
  )
}

/**
 * Profile image component with optimized circular display
 */
export function OptimizedProfileImage({
  src,
  alt,
  size = 100,
  className = ''
}: {
  src: string | null | undefined
  alt: string
  size?: number
  className?: string
}) {
  return (
    <div
      className={`relative rounded-full overflow-hidden bg-gray-200 ${className}`}
      style={{ width: size, height: size }}
    >
      <OptimizedImage
        src={src}
        alt={alt}
        width={size}
        height={size}
        quality={85}
        className="w-full h-full object-cover"
      />
    </div>
  )
}

/**
 * Card image component with optimized display for business cards
 */
export function OptimizedCardImage({
  src,
  alt,
  className = ''
}: {
  src: string | null | undefined
  alt: string
  className?: string
}) {
  return (
    <div className={`relative aspect-video bg-gray-100 rounded-lg overflow-hidden ${className}`}>
      <OptimizedImage
        src={src}
        alt={alt}
        width={800}
        height={450}
        quality={80}
        className="w-full h-full object-cover"
      />
    </div>
  )
}