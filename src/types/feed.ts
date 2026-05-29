export type Feed = {
  id: number
  name: string
  url: string
  count: number
  collectionId: number | null
}

export type FeedAPI = {
  id: number
  name: string
  url: string
  count: number
  collection_id: number | null
}

export type FeedFilter = 'all' | 'unread' | 'favorite'
