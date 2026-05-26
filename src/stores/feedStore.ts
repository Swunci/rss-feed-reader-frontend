import { type FeedFilter, type Feed } from '@/types/feed'
import { computed, ref, watch } from 'vue'
import { useDelete } from '../composables/api/useDelete'
import { useFetch } from '../composables/api/useFetch'
import { usePost } from '../composables/api/usePost'
import { endpoints } from '@/api/endpoints'
import { useItemSSE } from '../composables/api/useItemSSE'
import { usePatch } from '@/composables/api/usePatch'

const activeFeed = ref<Feed | null>(null)
const showAddModal = ref(false)
const showDeleteModal = ref(false)
const showRenameModal = ref(false)
const feedFilter = ref<FeedFilter>('all')

const { itemEvent } = useItemSSE()

const {
  data: feeds,
  loading: feedsLoading,
  error: feedsError,
  fetchData: fetchFeeds,
} = useFetch<Feed[]>()
const {
  data: feed,
  loading: loadingFeed,
  error: postFeedError,
  postData: postFeed,
} = usePost<Feed>()

const { loading: loadingPatchFeed, error: patchFeedError, patchData: patchFeed } = usePatch()
const { loading: loadingDeleteFeed, error: deleteFeedError, deleteData: deleteFeed } = useDelete()

const filteredFeeds = computed(() => {
  if (feedFilter.value === 'all') return feeds.value ?? []
  return feeds.value?.filter((f) => f.count > 0 || f.id === activeFeed.value?.id) ?? []
})

const fetchFilteredFeeds = async () => {
  console.log(
    `fetchFilteredFeeds -> filter: ${feedFilter.value}, activeFeed: ${JSON.stringify(activeFeed.value)}`,
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
}

const handleAddFeed = async (feedUrl: string) => {
  const success = await postFeed(endpoints.feeds.create, { url: feedUrl })
  if (success) {
    console.log(`Created feed ${JSON.stringify(feed.value)}`)
    showAddModal.value = false
    await fetchFilteredFeeds()
  }
}

const handleDeleteFeed = async () => {
  const success = await deleteFeed(endpoints.feeds.delete(activeFeed.value!.id))
  if (success) {
    showDeleteModal.value = false
    feeds.value = feeds.value?.filter((f) => f.id !== activeFeed.value!.id) ?? []
    activeFeed.value = null
  }
}

const handleRenameFeed = async (newName: string) => {
  const success = await patchFeed(endpoints.feeds.update(activeFeed.value!.id), { name: newName })
  if (success) {
    showRenameModal.value = false
    feeds.value = feeds.value!.map((f) => {
      if (f.id === activeFeed.value?.id) {
        f.name = newName
      }
      return f
    })
  }
}

const handleRefreshFeeds = async () => {
  const success = await postFeed(endpoints.feeds.refreshAll, {})
  if (success) {
    console.log('polling new items successful')
    await fetchFilteredFeeds()
  }
}

const viewAll = async () => {
  feedFilter.value = 'all'
  await fetchFilteredFeeds()
}
const viewUnread = async () => {
  feedFilter.value = 'unread'
  await fetchFilteredFeeds()
}
const viewFavorites = async () => {
  feedFilter.value = 'favorite'
  await fetchFilteredFeeds()
}

watch(itemEvent, async () => {
  console.log('Updating feeds counts')
  await fetchFilteredFeeds()
})

function init() {
  fetchFeeds(endpoints.feeds.getAll)
}

init()

export function feedStore() {
  return {
    activeFeed,
    showAddModal,
    showDeleteModal,
    showRenameModal,
    feedFilter,
    feeds,
    filteredFeeds,
    feedsLoading,
    feedsError,
    loadingFeed,
    postFeedError,
    loadingDeleteFeed,
    deleteFeedError,
    loadingPatchFeed,
    patchFeedError,
    handleAddFeed,
    handleDeleteFeed,
    handleRefreshFeeds,
    handleRenameFeed,
    viewAll,
    viewUnread,
    viewFavorites,
  }
}
