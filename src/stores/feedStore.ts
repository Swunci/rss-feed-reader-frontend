import { type FeedFilter, type Feed, type FeedAPI } from '@/types/feed'
import { computed, ref, watch } from 'vue'
import { useDelete } from '../composables/api/useDelete'
import { useFetch } from '../composables/api/useFetch'
import { usePost } from '../composables/api/usePost'
import { endpoints } from '@/api/endpoints'
import { usePatch } from '@/composables/api/usePatch'
import { normalizeFeedFields } from '@/utils/normalizer'
import type { DraggableEvent } from 'vue-draggable-plus'

const activeFeed = ref<Feed | null>(null)
const feedFilter = ref<FeedFilter>('all')

const collectionsFeedMap = ref<Record<number, Feed[]>>({})
const uncollectedFeeds = ref<Feed[]>([])

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

const addFeed = async (feedUrl: string) => {
  const success = await postFeed(endpoints.feeds.create, { url: feedUrl })
  if (success) {
    console.log(`Created feed ${JSON.stringify(feed.value)}`)
    await fetchFilteredFeeds()
  }
  return success
}

const removeFeed = async (feedId: number) => {
  const success = await deleteFeed(endpoints.feeds.delete(feedId))
  if (success) {
    feeds.value = feeds.value?.filter((f) => f.id !== feedId) ?? []
    activeFeed.value = null
  }
  return success
}

const renameFeed = async (feedId: number, newName: string) => {
  const success = await patchFeed(endpoints.feeds.update(feedId), { name: newName })
  if (success) {
    feeds.value = feeds.value!.map((f) => {
      if (f.id === feedId) {
        f.name = newName
      }
      return f
    })
  }
  return success
}

const refreshFeeds = async () => {
  const success = await postFeed(endpoints.feeds.refreshAll, {})
  if (success) {
    console.log('polling new items successful')
    await fetchFilteredFeeds()
  }
  return success
}

const moveFeedIntoCollection = async (e: DraggableEvent, collectionId: number) => {
  const feedId = uncollectedFeeds.value[e.oldIndex!]!.id
  console.log(`Add feed (${feedId}) to collection (${collectionId})`)
  const success = await patchFeed(endpoints.feeds.update(feedId), { collection_id: collectionId })
  if (success) {
    console.log(`Feed to collection success`)
    feeds.value =
      feeds.value?.map((f) => {
        if (f.id === feedId) {
          f.collectionId = collectionId
        }
        return f
      }) ?? []
  }
}

const moveFeedOutOfCollection = async (e: DraggableEvent) => {
  const feedId = uncollectedFeeds.value[e.newIndex!]!.id
  const success = await deleteFeed(endpoints.feeds.removeCollection(feedId))
  if (success) {
    console.log(`Feed removed from collection`)
    feeds.value =
      feeds.value?.map((f) => {
        if (f.id === feedId) {
          f.collectionId = null
        }
        return f
      }) ?? []
  }
}

function init() {
  fetchFeeds(endpoints.feeds.getAll)
}

init()

export function useFeedStore() {
  return {
    activeFeed,
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
    addFeed,
    removeFeed,
    refreshFeeds,
    renameFeed,
    moveFeedIntoCollection,
    moveFeedOutOfCollection,
    updateFeedItemCount,
    fetchFilteredFeeds,
  }
}
