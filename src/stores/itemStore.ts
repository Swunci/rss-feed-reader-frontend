import type { Feed, FeedFilter } from '@/types/feed'
import type { Item, ItemAPI } from '@/types/item'
import { computed, ref, watch } from 'vue'
import { useFetch } from '../composables/api/useFetch'
import { normalizeItemFields } from '@/utils/normalizer'
import { usePatch } from '../composables/api/usePatch'
import { endpoints } from '@/api/endpoints'
import { useToast } from 'vue-toastification'
import { feedStore } from './feedStore'
import { useItemSSE } from '@/composables/api/useItemSSE'
import { collectionStore } from './collectionStore'
import type { Collection } from '@/types/collection'

const { activeCollection } = collectionStore()
const { activeFeed, feedFilter, feeds } = feedStore()

const activeItem = ref<Item | null>(null)
const toast = useToast()
const items = ref<Item[]>([])
const cursor = ref<string>('')
const hasMore = ref<boolean>(true)

const {
  data: fetchedItems,
  loading: itemsLoading,
  error: itemsError,
  fetchData: fetchItems,
} = useFetch<ItemAPI[], Item[]>((data) => data.map(normalizeItemFields))
const { patchData: patchItem } = usePatch()
const { patchData: patchItemAllRead } = usePatch()

const getItemsFromAPI = async (
  activeFeed: Feed | null,
  activeCollection: Collection | null,
  feedFilter: FeedFilter,
  cursorVal: string,
) => {
  if (activeFeed !== null) {
    console.log('filter: %s, activeFeed: %s', feedFilter, JSON.stringify(activeFeed))
    switch (feedFilter) {
      case 'unread':
        await fetchItems(endpoints.items.getUnreadByFeed(activeFeed.id, cursorVal))
        break
      case 'favorite':
        await fetchItems(endpoints.items.getFavoriteByFeed(activeFeed.id, cursorVal))
        break
      default:
        await fetchItems(endpoints.items.getByFeed(activeFeed.id, cursorVal))
    }
  } else if (activeCollection !== null) {
    console.log('filter: %s, activeCollection: %s', feedFilter, JSON.stringify(activeCollection))
    switch (feedFilter) {
      case 'unread':
        await fetchItems(endpoints.items.getUnreadByCollection(activeCollection.id, cursorVal))
        break
      case 'favorite':
        await fetchItems(endpoints.items.getFavoriteByCollection(activeCollection.id, cursorVal))
        break
      default:
        await fetchItems(endpoints.items.getByCollection(activeCollection.id, cursorVal))
    }
  } else {
    console.log('filter: %s', feedFilter)
    switch (feedFilter) {
      case 'unread':
        await fetchItems(endpoints.items.getAllUnreadItems(cursorVal))
        break
      case 'favorite':
        await fetchItems(endpoints.items.getAllFavoriteItems(cursorVal))
        break
      default:
        await fetchItems(endpoints.items.getAllItems(cursorVal))
    }
  }
}

const appendNewItems = () => {
  if (fetchedItems.value) {
    items.value = [...items.value, ...fetchedItems.value]
    if (fetchedItems.value.length < 50) {
      hasMore.value = false
      return
    }
    cursor.value = fetchedItems.value.at(-1)!.publishedAt
    console.log(`updating cursor ${cursor.value}`)
  }
}

const mergeNewItems = () => {
  if (fetchedItems.value) {
    if (items.value.length === 0) {
      appendNewItems()
    } else {
      const latestItem = items.value[0]
      items.value = [
        ...fetchedItems.value.filter((item) => item.publishedAt > latestItem!.publishedAt),
        ...items.value,
      ]
    }
  }
}

const updateFeedItemCount = (feeds: Feed[], feed_id: number, value: number) => {
  const feed = feeds.find((f) => f.id === feed_id)
  if (feed) {
    feed.count += value
  }
}

const activeSelection = computed(() => activeFeed.value ?? activeCollection.value)

watch([activeSelection, feedFilter], async () => {
  items.value = []
  cursor.value = ''
  hasMore.value = true
  activeItem.value = null
  await getItemsFromAPI(activeFeed.value, activeCollection.value, feedFilter.value, cursor.value)
  appendNewItems()
})

const handleSelectItem = async (item: Item) => {
  activeItem.value = item
  if (!item.isRead) {
    if (feedFilter.value === 'unread') updateFeedItemCount(feeds.value ?? [], item.feedId, -1)
    item.isRead = true
    const success = await patchItem(endpoints.items.markRead(item.id), { is_read: true })
    if (!success) {
      if (feedFilter.value === 'unread') updateFeedItemCount(feeds.value ?? [], item.feedId, 1)
      item.isRead = false
    }
  }
}

const handleMarkReadItem = async () => {
  if (activeItem.value == null) return
  activeItem.value.isRead = !activeItem.value.isRead
  if (feedFilter.value === 'unread')
    updateFeedItemCount(
      feeds.value ?? [],
      activeItem.value.feedId,
      activeItem.value.isRead ? -1 : 1,
    )
  const success = await patchItem(endpoints.items.markRead(activeItem.value.id), {
    is_read: activeItem.value.isRead,
  })
  if (!success) {
    activeItem.value.isRead = !activeItem.value.isRead
    if (feedFilter.value === 'unread')
      updateFeedItemCount(
        feeds.value ?? [],
        activeItem.value.feedId,
        activeItem.value.isRead ? -1 : 1,
      )
  }
}

const handleFavoriteItem = async () => {
  if (activeItem.value == null) return
  activeItem.value.isFavorite = !activeItem.value.isFavorite
  if (feedFilter.value === 'favorite')
    updateFeedItemCount(
      feeds.value ?? [],
      activeItem.value.feedId,
      activeItem.value.isFavorite ? 1 : -1,
    )
  const success = await patchItem(endpoints.items.favorite(activeItem.value.id), {
    is_favorite: !activeItem.value.isFavorite,
  })
  if (!success) {
    activeItem.value.isFavorite = !activeItem.value.isFavorite
    if (feedFilter.value === 'favorite')
      updateFeedItemCount(
        feeds.value ?? [],
        activeItem.value.feedId,
        activeItem.value.isFavorite ? 1 : -1,
      )
  }
}

const handleMarkAllRead = async () => {
  if (activeFeed.value == null) return
  const unreadItemIDs = new Set(items.value?.filter((i) => !i.isRead).map((i) => i.id))
  const count = activeFeed.value.count
  if (feedFilter.value === 'unread')
    updateFeedItemCount(feeds.value ?? [], activeFeed.value.id, -count)
  const success = await patchItemAllRead(endpoints.items.markAllRead, {
    item_ids: [...unreadItemIDs],
    is_read: true,
  })
  items.value?.forEach((i) => (i.isRead = true))
  if (!success) {
    toast.error('Failed to mark all as read')
    if (feedFilter.value === 'unread')
      updateFeedItemCount(feeds.value ?? [], activeFeed.value.id, count)
    items.value?.forEach((i) => {
      if (unreadItemIDs.has(i.id)) i.isRead = false
    })
  }
}

const handleOpenLink = () => {
  if (activeItem.value != null) window.open(activeItem.value.link, '_blank', 'noopener,noreferrer')
}

const handleRefreshItems = async () => {
  cursor.value = ''
  items.value = []
  hasMore.value = true
  await getItemsFromAPI(activeFeed.value, activeCollection.value, feedFilter.value, cursor.value)
  appendNewItems()
}

const loadMore = async () => {
  console.log(
    'loadMore called, activeFeed:',
    activeFeed.value,
    'activeCollection',
    activeCollection.value,
    'hasMore:',
    hasMore.value,
    'loading:',
    itemsLoading.value,
  )
  if (itemsLoading.value) return
  await getItemsFromAPI(activeFeed.value, activeCollection.value, feedFilter.value, cursor.value)
  appendNewItems()
}

export function itemStore() {
  return {
    items,
    itemsLoading,
    itemsError,
    activeItem,
    hasMore,
    handleMarkReadItem,
    handleFavoriteItem,
    handleSelectItem,
    handleMarkAllRead,
    handleOpenLink,
    handleRefreshItems,
    loadMore,
    getItemsFromAPI,
    mergeNewItems,
    appendNewItems,
  }
}
