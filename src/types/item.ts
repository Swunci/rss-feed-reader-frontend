export type Item = {
  id: number
  feedId: number
  title: string
  description: string
  link: string
  publishedAt: string
  isRead: boolean
  isFavorite: boolean
}

export type ItemAPI = {
  id: number
  feed_id: number
  title: string
  description: string
  link: string
  published_at: string
  is_read: boolean
  is_favorite: boolean
}

export type ItemEvent = {
  feedId: number
}
