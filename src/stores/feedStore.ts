import { type FeedFilter, type Feed, type FeedAPI } from '@/types/feed'
import { computed, ref, watch } from 'vue'
import { useDelete } from '../composables/api/useDelete'
import { useFetch } from '../composables/api/useFetch'
import { usePost } from '../composables/api/usePost'
import { endpoints } from '@/api/endpoints'
import { useItemSSE } from '../composables/api/useItemSSE'
import { usePatch } from '@/composables/api/usePatch'
import { normalizeFeedFields } from '@/utils/normalizer'
import type { DraggableEvent } from 'vue-draggable-plus'

const activeFeed = ref<Feed | null>(null)
const showAddFeedModal = ref(false)
const showDeleteFeedModal = ref(false)
const showRenameFeedModal = ref(false)
const feedFilter = ref<FeedFilter>('all')

const collectionsFeedMap = ref<Record<number, Feed[]>>({})
const uncollectedFeeds = ref<Feed[]>([])

const { itemEvent } = useItemSSE()

const {
  data: feeds,
  loading: feedsLoading,
  error: feedsError,
  fetchData: fetchFeeds,
} = useFetch<FeedAPI[], Feed[]>((data) => data.map(normalizeFeedFields))
const {
  data: feed,
  loading: loadingPostFeed,
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

const updateFeedItemCount = (feed_id: number, value: number) => {
  if (feeds.value != null) {
    const feed = feeds.value.find((f) => f.id === feed_id)
    if (feed) {
      feed.count += value
    }
  }
}

const handleAddFeed = async (feedUrl: string) => {
  const success = await postFeed(endpoints.feeds.create, { url: feedUrl })
  if (success) {
    console.log(`Created feed ${JSON.stringify(feed.value)}`)
    showAddFeedModal.value = false
    await fetchFilteredFeeds()
  }
}

const handleDeleteFeed = async () => {
  const success = await deleteFeed(endpoints.feeds.delete(activeFeed.value!.id))
  if (success) {
    showDeleteFeedModal.value = false
    feeds.value = feeds.value?.filter((f) => f.id !== activeFeed.value!.id) ?? []
    activeFeed.value = null
  }
}

const handleRenameFeed = async (newName: string) => {
  const success = await patchFeed(endpoints.feeds.update(activeFeed.value!.id), { name: newName })
  if (success) {
    showRenameFeedModal.value = false
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

const handleFeedIntoCollection = async (e: DraggableEvent, collectionId: number) => {
  const feedId = uncollectedFeeds.value[e.oldIndex!]!.id
  console.log(`Add feed (${feedId}) to collection (${collectionId})`)
  const success = await patchFeed(endpoints.feeds.update(feedId), { collection_id: collectionId })
  if (success) {
    console.log(`Feed to collection success`)
    feeds.value = feeds.value!.map((f) => {
      if (f.id === feedId) {
        f.collectionId = collectionId
      }
      return f
    })
  }
}

const handleFeedOutOfCollection = async (e: DraggableEvent) => {
  const feedId = uncollectedFeeds.value[e.newIndex!]!.id
  const success = await deleteFeed(endpoints.feeds.removeCollection(feedId))
  if (success) {
    console.log(`Feed removed from collection`)
    feeds.value = feeds.value!.map((f) => {
      if (f.id === feedId) {
        f.collectionId = null
      }
      return f
    })
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

export function useFeedStore() {
  return {
    activeFeed,
    showAddFeedModal,
    showDeleteFeedModal,
    showRenameFeedModal,
    feedFilter,
    feeds,
    filteredFeeds,
    feedsLoading,
    feedsError,
    loadingPostFeed,
    postFeedError,
    loadingDeleteFeed,
    deleteFeedError,
    loadingPatchFeed,
    patchFeedError,
    collectionsFeedMap,
    uncollectedFeeds,
    handleAddFeed,
    handleDeleteFeed,
    handleRefreshFeeds,
    handleRenameFeed,
    viewAll,
    viewUnread,
    viewFavorites,
    handleFeedIntoCollection,
    handleFeedOutOfCollection,
    updateFeedItemCount,
  }
}
