import { endpoints } from '@/api/endpoints'
import type { ItemEvent } from '@/types/item'
import { ref } from 'vue'

const itemEvent = ref<ItemEvent | null>(null)

const eventSource = new EventSource(endpoints.items.getItemEvents)
eventSource.onopen = () => console.log('SSE connected')
eventSource.onerror = (e) => console.log('SSE error', e)
eventSource.onmessage = (event) => {
  itemEvent.value = JSON.parse(event.data)
  console.log(`Item event recieved, feed_id ${itemEvent.value?.feedId}`)
}

export function useItemSSE() {
  return { itemEvent }
}
