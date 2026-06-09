import { ref } from 'vue'
import axios from 'axios'
import log from '@/utils/logger'

export function useFetch<T, R = T>(transform?: (data: T) => R) {
  const data = ref<R | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const fetchData = async (url: string) => {
    loading.value = true
    error.value = null
    try {
      const response = await axios.get<T>(url)
      data.value = transform ? transform(response.data) : (response.data as unknown as R)
    } catch (err) {
      log.error('Fetch error', { url, err })
      if (axios.isAxiosError(err)) {
        error.value = err.response?.data?.message || err.message
      } else {
        error.value = `An unexpected error occurred fetching from ${url}`
      }
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, fetchData }
}
