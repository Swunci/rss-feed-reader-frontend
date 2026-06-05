import { type FeedFilter, type Feed, type FeedAPI, type DiscoverFeed } from '@/types/feed'
import { computed, ref } from 'vue'
import { useDelete } from '../composables/api/useDelete'
import { useFetch } from '../composables/api/useFetch'
import { usePost } from '../composables/api/usePost'
import { endpoints } from '@/api/endpoints'
import { usePatch } from '@/composables/api/usePatch'
import { normalizeFeedFields } from '@/utils/normalizer'

const activeFeed = ref<Feed | null>(null)
const feedFilter = ref<FeedFilter>('all')

const uncollectedFeeds = ref<Feed[]>([])

const idFeedMap = computed(() => {
  return (
    feeds.value?.reduce(
      (acc, feed) => {
        acc[feed.id] = feed
        return acc
      },
      {} as Record<number, Feed>,
    ) ?? {}
  )
})

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
const {
  data: discoveredFeeds,
  loading: discoverLoading,
  error: discoverError,
  postData: postDiscoverFeeds,
} = usePost<DiscoverFeed[]>()

const { loading: loadingPatchFeed, error: patchFeedError, patchData: patchFeed } = usePatch()
const { loading: loadingDeleteFeed, error: deleteFeedError, deleteData: deleteFeed } = useDelete()

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

const addFeed = async (feedUrl: string, name: string) => {
  const success = await postFeed(endpoints.feeds.create, { url: feedUrl, name })
  if (success) {
    console.log(`Created feed ${JSON.stringify(feed.value)}`)
    await fetchFilteredFeeds()
  }
  return success
}

const discoverFeeds = async (feedUrl: string) => {
  return await postDiscoverFeeds(endpoints.feeds.discover, { url: feedUrl })
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

const moveFeedIntoCollection = async (feedId: number, collectionId: number) => {
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
  return success
}

const moveFeedOutOfCollection = async (feedId: number) => {
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
  return success
}

async function init() {
  await fetchFeeds(endpoints.feeds.getAll)
}

init()

export function useFeedStore() {
  return {
    activeFeed,
    feedFilter,
    feeds,
    feedsLoading,
    feedsError,
    loadingPostFeed,
    postFeedError,
    loadingDeleteFeed,
    deleteFeedError,
    loadingPatchFeed,
    patchFeedError,
    uncollectedFeeds,
    idFeedMap,
    discoveredFeeds,
    discoverLoading,
    discoverError,
    addFeed,
    removeFeed,
    refreshFeeds,
    renameFeed,
    moveFeedIntoCollection,
    moveFeedOutOfCollection,
    updateFeedItemCount,
    fetchFilteredFeeds,
    discoverFeeds,
  }
}
