import { endpoints } from '@/api/endpoints'
import type { ItemEvent } from '@/types/item'
import { ref } from 'vue'

const eventSource = ref<EventSource | null>(null)
const itemEvent = ref<ItemEvent | null>(null)

export function useItemSSE() {
  console.log('useItemSSE called, eventSource:', eventSource.value)
  if (!eventSource.value) {
    eventSource.value = new EventSource(endpoints.items.getItemEvents)
    eventSource.value.onopen = () => console.log('SSE connected')
    eventSource.value.onerror = (e) => console.log('SSE error', e)
    eventSource.value.onmessage = (event) => {
      console.log('Item event recieved')
      itemEvent.value = JSON.parse(event.data)
    }
  }
  return { itemEvent }
}
