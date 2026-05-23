import { ref, onMounted, onUnmounted, type Ref } from 'vue'

interface ScrollOptions {
  loading: Ref<boolean>
  hasMore: Ref<boolean>
  rootSelector?: string // Optional: target container selector
  rootMargin?: string // Optional: margin buffer
}

export function useInfiniteScroll(onLoadMore: () => void, options: ScrollOptions) {
  const sentinelRef = ref<HTMLDivElement | null>(null)
  let observer: IntersectionObserver | null = null

  const setupObserver = () => {
    if (observer) observer.disconnect()

    observer = new IntersectionObserver(
      ([entry]) => {
        // Trigger only if visible, not loading, and more data is left
        if (entry?.isIntersecting && !options.loading.value && options.hasMore.value) {
          onLoadMore()
        }
      },
      {
        root: options.rootSelector ? document.querySelector(options.rootSelector) : null,
        rootMargin: options.rootMargin || '200px',
      },
    )

    if (sentinelRef.value) {
      observer.observe(sentinelRef.value)
    }
  }

  onMounted(() => setupObserver())

  onUnmounted(() => {
    if (observer) observer.disconnect()
  })

  return { sentinelRef }
}
