import { type FeedFilter, type Feed } from '@/types/feed'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useDelete } from './api/useDelete'
import { useFetch } from './api/useFetch'
import { usePost } from './api/usePost'
import { endpoints } from '@/api/endpoints'
import { useItemSSE } from './api/useItemSSE'

export function useFeeds() {
  const activeFeed = ref<Feed | null>(null)
  const showAddModal = ref(false)
  const showDeleteModal = ref(false)
  const feedFilter = ref<FeedFilter>('all')

  const { itemEvent } = useItemSSE()

  const {
    data: feeds,
    loading: feedsLoading,
    error: feedsError,
    fetchData: fetchFeeds,
  } = useFetch<Feed[]>()

  const filteredFeeds = computed(() => {
    if (feedFilter.value === 'all') {
      return feeds.value ?? []
    }
    return feeds.value?.filter((feed) => feed.count > 0 || feed.id === activeFeed.value?.id) ?? []
  })

  const { data: feed, loading: loadingFeed, error: feedError, postData: postFeed } = usePost<Feed>()

  const { loading: loadingDeleteFeed, error: deleteFeedError, deleteData: deleteFeed } = useDelete()

  const handleAddFeed = async (feedUrl: string) => {
    console.log('adding feed:', feedUrl)
    const success = await postFeed(endpoints.feeds.create, { url: feedUrl })
    if (success) {
      console.log(JSON.stringify(feed.value))
      showAddModal.value = false
      await fetchFeedsFilter()
    }
  }
  const handleDeleteFeed = async () => {
    console.log('deleting feed:', activeFeed.value!.url)
    const success = await deleteFeed(endpoints.feeds.delete(activeFeed.value!.id))
    if (success) {
      showDeleteModal.value = false
      feeds.value = feeds.value?.filter((f) => f.id !== activeFeed.value!.id) ?? []
      activeFeed.value = null
    }
  }

  const handleRefreshFeeds = async () => {
    const success = await postFeed(endpoints.feeds.refreshAll, {})
    if (success) {
      console.log('polling new items successful')
      fetchFeedsFilter()
    }
  }

  const viewAll = async () => {
    feedFilter.value = 'all'
    await fetchFeedsFilter()
  }

  const viewUnread = async () => {
    feedFilter.value = 'unread'
    await fetchFeedsFilter()
  }

  const viewFavorites = async () => {
    feedFilter.value = 'favorite'
    await fetchFeedsFilter()
  }

  const fetchFeedsFilter = async () => {
    console.log(
      `fetchFeedsFilter filter: ${feedFilter.value}, activeFeed: ${JSON.stringify(activeFeed.value)}`,
    )
    switch (feedFilter.value) {
      case 'unread':
        await fetchFeeds(endpoints.feeds.getUnread)
        break
      case 'favorite':
        await fetchFeeds(endpoints.feeds.getFavorite)
        break
      default:
        await fetchFeeds(endpoints.feeds.getAll)
    }
    return
  }
  onMounted(() => {
    fetchFeeds(endpoints.feeds.getAll)
  })

  watch(itemEvent, async () => {
    console.log(`Updating feeds counts`)
    await fetchFeedsFilter()
  })

  return {
    activeFeed,
    showAddModal,
    showDeleteModal,
    feedFilter,
    feeds,
    filteredFeeds,
    feedsLoading,
    feedsError,
    loadingFeed,
    feedError,
    loadingDeleteFeed,
    deleteFeedError,
    handleAddFeed,
    handleDeleteFeed,
    handleRefreshFeeds,
    viewAll,
    viewUnread,
    viewFavorites,
  }
}
