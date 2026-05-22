export interface Feed {
  id: number
  name: string
  url: string
  count: number
}
export type FeedFilter = 'all' | 'unread' | 'favorite'
