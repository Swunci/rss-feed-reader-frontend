import type { Feed, FeedFilter } from '@/types/feed'
import type { Item, ItemAPI } from '@/types/item'
import { ref } from 'vue'
import { useFetch } from '../composables/api/useFetch'
import { normalizeItemFields } from '@/utils/normalizer'
import { usePatch } from '../composables/api/usePatch'
import { endpoints } from '@/api/endpoints'

import type { Collection } from '@/types/collection'
import log from '@/utils/logger'

const activeItem = ref<Item | null>(null)
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
    log.debug('Fetch items by feed', { filter: feedFilter, feedId: activeFeed.id })
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
    log.debug('Fetch items by collection', {
      filter: feedFilter,
      collectionId: activeCollection.id,
    })
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
    log.debug('Fetch all items', { filter: feedFilter })
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

const resetItems = () => {
  items.value = []
  cursor.value = ''
  hasMore.value = true
  activeItem.value = null
}

const appendNewItems = () => {
  if (fetchedItems.value) {
    items.value = [...items.value, ...fetchedItems.value]
    if (fetchedItems.value.length < 50) {
      hasMore.value = false
      return
    }
    cursor.value = fetchedItems.value.at(-1)!.publishedAt
    log.debug('Cursor updated', { cursor: cursor.value })
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

const selectItem = async (item: Item) => {
  activeItem.value = item
  if (!item.isRead) {
    item.isRead = true
    const success = await patchItem(endpoints.items.markRead(item.id), { is_read: true })
    if (!success) {
      item.isRead = false
    }
  }
}

const markItemRead = async () => {
  if (activeItem.value == null) return
  activeItem.value.isRead = !activeItem.value.isRead
  const success = await patchItem(endpoints.items.markRead(activeItem.value.id), {
    is_read: activeItem.value.isRead,
  })
  if (!success) {
    activeItem.value.isRead = !activeItem.value.isRead
  }
  return success
}

const toggleFavorite = async () => {
  if (activeItem.value == null) return false
  activeItem.value.isFavorite = !activeItem.value.isFavorite
  const success = await patchItem(endpoints.items.favorite(activeItem.value.id), {
    is_favorite: activeItem.value.isFavorite,
  })
  if (!success) activeItem.value.isFavorite = !activeItem.value.isFavorite
  return success
}

const markAllRead = async () => {
  const unreadItemIDs = new Set(items.value?.filter((i) => !i.isRead).map((i) => i.id))
  log.debug('Mark all read', { count: unreadItemIDs.size })
  items.value?.forEach((i) => (i.isRead = true))
  const success = await patchItemAllRead(endpoints.items.markAllRead, {
    item_ids: [...unreadItemIDs],
    is_read: true,
  })
  if (!success) {
    items.value?.forEach((i) => {
      if (unreadItemIDs.has(i.id)) i.isRead = false
    })
  }
  return { success, unreadCount: unreadItemIDs.size }
}

const loadMore = async (
  activeFeed: Feed | null,
  activeCollection: Collection | null,
  feedFilter: FeedFilter,
  cursor: string,
) => {
  if (itemsLoading.value) return
  await getItemsFromAPI(activeFeed, activeCollection, feedFilter, cursor)
  appendNewItems()
}

export function useItemStore() {
  return {
    items,
    itemsLoading,
    itemsError,
    activeItem,
    hasMore,
    cursor,
    selectItem,
    markItemRead,
    toggleFavorite,
    markAllRead,
    loadMore,
    getItemsFromAPI,
    mergeNewItems,
    appendNewItems,
    resetItems,
  }
}
