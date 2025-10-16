/**
 * Image optimization utilities for Supabase Storage
 * Provides helper functions to optimize image URLs with transformation parameters
 */

interface ImageTransformOptions {
  width?: number
  height?: number
  quality?: number
  format?: 'webp' | 'avif' | 'auto'
  resize?: 'cover' | 'contain' | 'fill'
}

/**
 * Generate optimized image URL for Supabase Storage images
 * @param url - Original Supabase Storage URL
 * @param options - Transformation options
 * @returns Optimized URL with transformation parameters
 */
export function getOptimizedImageUrl(
  url: string | null | undefined,
  options: ImageTransformOptions = {}
): string {
  if (!url) return ''

  // Check if it's a Supabase Storage URL
  if (!url.includes('supabase') && !url.includes('storage')) {
    return url // Return original URL if not Supabase Storage
  }

  const {
    width = 800,
    height,
    quality = 80,
    format = 'webp',
    resize = 'cover'
  } = options

  // Build transformation parameters
  const transforms: string[] = []

  if (width) transforms.push(`width=${width}`)
  if (height) transforms.push(`height=${height}`)
  transforms.push(`quality=${quality}`)
  if (format !== 'auto') transforms.push(`format=${format}`)
  transforms.push(`resize=${resize}`)

  // Apply transformations to URL
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}${transforms.join('&')}`
}

/**
 * Get responsive image sizes for different screen widths
 * @param baseUrl - Original image URL
 * @returns Object with URLs for different sizes
 */
export function getResponsiveImageSet(baseUrl: string | null | undefined) {
  if (!baseUrl) {
    return {
      thumbnail: '',
      small: '',
      medium: '',
      large: '',
      original: ''
    }
  }

  return {
    thumbnail: getOptimizedImageUrl(baseUrl, { width: 150, height: 150, quality: 70 }),
    small: getOptimizedImageUrl(baseUrl, { width: 400, quality: 75 }),
    medium: getOptimizedImageUrl(baseUrl, { width: 800, quality: 80 }),
    large: getOptimizedImageUrl(baseUrl, { width: 1200, quality: 85 }),
    original: baseUrl
  }
}

/**
 * Generate srcset attribute for responsive images
 * @param baseUrl - Original image URL
 * @returns srcset string for img element
 */
export function generateSrcSet(baseUrl: string | null | undefined): string {
  if (!baseUrl) return ''

  const sizes = [
    { width: 400, descriptor: '400w' },
    { width: 800, descriptor: '800w' },
    { width: 1200, descriptor: '1200w' },
    { width: 1600, descriptor: '1600w' }
  ]

  return sizes
    .map(({ width, descriptor }) => {
      const url = getOptimizedImageUrl(baseUrl, { width, quality: 80 })
      return `${url} ${descriptor}`
    })
    .join(', ')
}

/**
 * Preload critical images for better performance
 * @param urls - Array of image URLs to preload
 */
export function preloadImages(urls: (string | null | undefined)[]): void {
  urls.forEach(url => {
    if (!url) return

    const link = document.createElement('link')
    link.rel = 'preload'
    link.as = 'image'
    link.href = getOptimizedImageUrl(url, { width: 800, format: 'webp' })
    document.head.appendChild(link)
  })
}

/**
 * Lazy load image with intersection observer
 * @param imageElement - Image element to lazy load
 * @param src - Image source URL
 */
export function lazyLoadImage(imageElement: HTMLImageElement, src: string): void {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement
          img.src = src
          img.classList.add('loaded')
          observer.unobserve(img)
        }
      })
    })

    imageObserver.observe(imageElement)
  } else {
    // Fallback for browsers that don't support IntersectionObserver
    imageElement.src = src
  }
}

/**
 * Check if image format is supported
 * @param format - Image format to check
 * @returns Promise that resolves to boolean
 */
export async function isFormatSupported(format: 'webp' | 'avif'): Promise<boolean> {
  const testImages = {
    webp: 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=',
    avif: 'data:image/avif;base64,AAAAHGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZgAAAPBtZXRhAAAAAAAAAChoZGxyAAAAAAAAAABwaWN0AAAAAAAAAAAAAAAAbGliYXZpZgAAAAAOcGl0bQAAAAAAAQAAAB5pbG9jAAAAAEQAAAEAAQAAAAEAAAEUAAAAKAAAAB'
  }

  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = testImages[format]
  })
}

/**
 * Get best supported image format
 * @returns Promise that resolves to best format
 */
export async function getBestImageFormat(): Promise<'webp' | 'avif' | 'auto'> {
  const [avifSupported, webpSupported] = await Promise.all([
    isFormatSupported('avif'),
    isFormatSupported('webp')
  ])

  if (avifSupported) return 'avif'
  if (webpSupported) return 'webp'
  return 'auto'
}

/**
 * Calculate optimal image dimensions based on container size
 * @param containerWidth - Container width in pixels
 * @param aspectRatio - Image aspect ratio (width/height)
 * @returns Optimal dimensions
 */
export function calculateOptimalDimensions(
  containerWidth: number,
  aspectRatio: number = 1
): { width: number; height: number } {
  // Account for device pixel ratio
  const dpr = window.devicePixelRatio || 1
  const width = Math.round(containerWidth * dpr)
  const height = Math.round(width / aspectRatio)

  // Cap at reasonable maximum to avoid huge images
  const maxWidth = 2400
  if (width > maxWidth) {
    return {
      width: maxWidth,
      height: Math.round(maxWidth / aspectRatio)
    }
  }

  return { width, height }
}