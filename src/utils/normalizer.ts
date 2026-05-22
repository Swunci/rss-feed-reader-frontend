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
