import type { Feed, FeedAPI } from '@/types/feed'
import type { Item, ItemAPI } from '@/types/item'

export function normalizeItemFields(item: ItemAPI): Item {
  return {
    id: item.id,
    feedId: item.feed_id,
    title: item.title,
    link: item.link,
    description: item.description,
    publishedAt: item.published_at,
    isRead: item.is_read,
    isFavorite: item.is_favorite,
  }
}

export function normalizeFeedFields(feed: FeedAPI): Feed {
  return {
    id: feed.id,
    name: feed.name,
    url: feed.url,
    count: feed.count,
    collectionId: feed.collection_id,
  }
}
