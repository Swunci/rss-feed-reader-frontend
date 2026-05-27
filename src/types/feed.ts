export type Feed = {
  id: number
  name: string
  url: string
  count: number
  collectionId: number
}

export type FeedAPI = {
  id: number
  name: string
  url: string
  count: number
  collection_id: number
}

export type FeedFilter = 'all' | 'unread' | 'favorite'
