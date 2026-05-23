const BASE_URL = 'http://localhost:8081'

export const endpoints = {
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
    getByFeed: (feedId: number, cursor: string) =>
      `${BASE_URL}/feeds/${feedId}/items?cursor=${cursor}`,
    getItemEvents: `${BASE_URL}/items/events`,
    getUnreadItems: (feedId: number, cursor: string) =>
      `${BASE_URL}/feeds/${feedId}/items?read=false&cursor=${cursor}`,
    getFavoriteItems: (feedId: number, cursor: string) =>
      `${BASE_URL}/feeds/${feedId}/items?favorite=true&cursor=${cursor}`,
    delete: (id: number) => `${BASE_URL}/items/${id}`,
    markRead: (id: number) => `${BASE_URL}/items/${id}/read`,
    markAllRead: `${BASE_URL}/items/read`,
    favorite: (id: number) => `${BASE_URL}/items/${id}/favorite`,
  },
}
