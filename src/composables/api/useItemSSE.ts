import { endpoints } from '@/api/endpoints'
import type { ItemEvent } from '@/types/item'
import log from '@/utils/logger'
import { ref } from 'vue'

const itemEvent = ref<ItemEvent | null>(null)

const eventSource = new EventSource(endpoints.items.getItemEvents)
eventSource.onopen = () => log.debug('SSE connected')
eventSource.onerror = (e) => log.error('SSE error', { e })
eventSource.onmessage = (event) => {
  itemEvent.value = JSON.parse(event.data)
  log.debug('SSE item event received', { feedId: itemEvent.value?.feedId })
}

export function useItemSSE() {
  return { itemEvent }
}
