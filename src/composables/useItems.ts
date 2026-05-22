import type { Feed, FeedFilter } from '@/types/feed'
import type { Item, ItemAPI } from '@/types/item'
import { ref, watch, type Ref } from 'vue'
import { useFetch } from './api/useFetch'
import { normalizeItemFields } from '@/utils/normalizer'
import { usePatch } from './api/usePatch'
import { endpoints } from '@/api/endpoints'
import { useToast } from 'vue-toastification'
import { useItemSSE } from './api/useItemSSE'

export function useItems(
  activeFeed: Ref<Feed | null>,
  feedFilter: Ref<FeedFilter>,
  feeds: Ref<Feed[] | null>,
) {
  const activeItem = ref<Item | null>(null)

  const toast = useToast()

  const items = ref<Item[]>([])

  const cursor = ref<string>('')

  const { itemEvent } = useItemSSE()

  const {
    data: fetchedItems,
    loading: itemsLoading,
    error: itemsError,
    fetchData: fetchItems,
  } = useFetch<ItemAPI[], Item[]>((data) => data.map(normalizeItemFields))

  const { patchData: patchItem } = usePatch()

  const { patchData: patchItemAllRead } = usePatch()

  const handleSelectItem = async (item: Item) => {
    activeItem.value = item
    if (!item.isRead) {
      console.log('marking item as read')
      if (feedFilter.value === 'unread') updateFeedItemCount(feeds.value ?? [], item.feedId, -1)
      item.isRead = true
      const success = await patchItem(endpoints.items.markRead(item.id), { is_read: true })
      if (!success) {
        console.log('reverting read mark')
        if (feedFilter.value === 'unread') updateFeedItemCount(feeds.value ?? [], item.feedId, 1)
        item.isRead = false
      }
    }
  }

  const handleMarkReadItem = async () => {
    if (activeItem.value != null) {
      console.log(
        `marking item ${activeItem.value.id} as ${activeItem.value.isRead ? 'unread' : 'read'}`,
      )
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
  }

  const handleFavoriteItem = async () => {
    if (activeItem.value != null) {
      console.log(
        `marking item ${activeItem.value.id} as ${activeItem.value.isFavorite ? 'unfavorite' : 'favorite'}`,
      )
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
  }

  const handleMarkAllRead = async () => {
    if (activeFeed.value != null) {
      const unreadItemIDs = new Set(
        items.value?.filter((item) => !item.isRead).map((item) => item.id),
      )
      const count = activeFeed.value.count
      if (feedFilter.value === 'unread')
        updateFeedItemCount(feeds.value ?? [], activeFeed.value.id, -count)
      const success = await patchItemAllRead(endpoints.items.markAllRead, {
        item_ids: [...unreadItemIDs],
        is_read: true,
      })
      items.value?.forEach((item) => (item.isRead = true))
      if (!success) {
        toast.error('Failed to mark all as read')
        console.log('reverting read marks')
        if (feedFilter.value === 'unread')
          updateFeedItemCount(feeds.value ?? [], activeFeed.value.id, count)
        items.value?.forEach((item) => {
          if (unreadItemIDs.has(item.id)) {
            item.isRead = false
          }
        })
      }
    }
  }

  const handleOpenLink = () => {
    if (activeItem.value != null) {
      window.open(activeItem.value.link, '_blank', 'noopener,noreferrer')
    }
  }

  const handleRefreshItems = async () => {
    console.log('updating current feed items')
    await getItemsFromAPI(activeFeed.value, feedFilter.value)
  }

  const loadMore = async () => {
    if (activeFeed.value == null) return
    await fetchItems(endpoints.items.getByFeed(activeFeed.value.id, cursor.value))
    if (fetchedItems.value) {
      items.value = [...items.value, ...fetchedItems.value]
    }
  }

  const getItemsFromAPI = async (activeFeed: Feed | null, feedFilter: string) => {
    if (activeFeed != null) {
      console.log('filter: %s, activeFeed: %s', feedFilter, JSON.stringify(activeFeed))
      switch (feedFilter) {
        case 'unread':
          await fetchItems(endpoints.items.getUnreadItems(activeFeed.id))
          break
        case 'favorite':
          await fetchItems(endpoints.items.getFavoriteItems(activeFeed.id))
          break
        default:
          await fetchItems(endpoints.items.getByFeed(activeFeed.id, cursor.value))
          if (itemsError.value) {
            console.log('problem fetching all items')
          }
      }
      if (fetchedItems.value) {
        items.value = [...items.value, ...fetchedItems.value]
      }
      return
    }
  }

  watch([activeFeed, feedFilter], async ([ActiveFeedValue]) => {
    items.value = []
    cursor.value = ''
    activeItem.value = null
    await getItemsFromAPI(ActiveFeedValue, feedFilter.value)
  })

  watch(itemEvent, async () => {
    console.log(`new items for feed with id: ${itemEvent.value?.feedId}`)
    if (itemEvent.value?.feedId == activeFeed.value?.id) {
      await getItemsFromAPI(activeFeed.value, feedFilter.value)
    }
  })

  return {
    items,
    itemsLoading,
    itemsError,
    activeItem,
    handleMarkReadItem,
    handleFavoriteItem,
    handleSelectItem,
    handleMarkAllRead,
    handleOpenLink,
    handleRefreshItems,
    loadMore,
  }
}

const updateFeedItemCount = (feeds: Feed[], feed_id: number, value: number) => {
  console.log('updating (feed, count) ', feed_id, value)
  for (const feed of feeds) {
    if (feed.id === feed_id) {
      feed.count += value
      console.log('updated count to', feed.count)
      return
    }
  }
}
