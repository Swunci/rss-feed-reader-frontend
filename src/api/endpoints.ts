const BASE_URL = 'http://localhost:8081'

export const endpoints = {
  collections: {
    getAll: `${BASE_URL}/collections`,
    create: `${BASE_URL}/collections`,
    update: (id: number) => `${BASE_URL}/collections/${id}`,
    delete: (id: number) => `${BASE_URL}/collections/${id}`,
  },
  feeds: {
    getAll: `${BASE_URL}/feeds`,
    getUnread: `${BASE_URL}/feeds?filter=unread`,
    getFavorite: `${BASE_URL}/feeds?filter=favorite`,
    create: `${BASE_URL}/feeds`,
    refreshAll: `${BASE_URL}/feeds/refresh`,
    refreshFeed: (id: number) => `${BASE_URL}/feeds/${id}/refresh`,
    delete: (id: number) => `${BASE_URL}/feeds/${id}`,
    update: (id: number) => `${BASE_URL}/feeds/${id}`,
  },
  items: {
    getItemEvents: `${BASE_URL}/items/events`,
    markAllRead: `${BASE_URL}/items/read`,
    getByFeed: (feedId: number, cursor: string) =>
      `${BASE_URL}/feeds/${feedId}/items?cursor=${cursor}`,
    getUnreadByFeed: (feedId: number, cursor: string) =>
      `${BASE_URL}/feeds/${feedId}/items?read=false&cursor=${cursor}`,
    getFavoriteByFeed: (feedId: number, cursor: string) =>
      `${BASE_URL}/feeds/${feedId}/items?favorite=true&cursor=${cursor}`,
    getByCollection: (collectionId: number, cursor: string) =>
      `${BASE_URL}/collections/${collectionId}/items?cursor=${cursor}`,
    getUnreadByCollection: (collectionId: number, cursor: string) =>
      `${BASE_URL}/collections/${collectionId}/items?read=false&cursor=${cursor}`,
    getFavoriteByCollection: (collectionId: number, cursor: string) =>
      `${BASE_URL}/collections/${collectionId}/items?favorite=true&cursor=${cursor}`,
    delete: (id: number) => `${BASE_URL}/items/${id}`,
    markRead: (id: number) => `${BASE_URL}/items/${id}/read`,
    favorite: (id: number) => `${BASE_URL}/items/${id}/favorite`,
  },
}
