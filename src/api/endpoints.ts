const BASE_URL = import.meta.env.VITE_API_BASE_URL

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
    discover: `${BASE_URL}/feeds/discover`,
    removeCollection: (id: number) => `${BASE_URL}/feeds/${id}/unassign`,
    refreshFeed: (id: number) => `${BASE_URL}/feeds/${id}/refresh`,
    delete: (id: number) => `${BASE_URL}/feeds/${id}`,
    update: (id: number) => `${BASE_URL}/feeds/${id}`,
  },
  items: {
    getItemEvents: `${BASE_URL}/items/events`,
    markAllRead: `${BASE_URL}/items/read`,
    getAllItems: (cursor: string, limit?: number) =>
      `${BASE_URL}/items?cursor=${cursor}${limit ? `&limit=${limit}` : ''}`,
    getAllUnreadItems: (cursor: string, limit?: number) =>
      `${BASE_URL}/items?read=false&cursor=${cursor}${limit ? `&limit=${limit}` : ''}`,
    getAllFavoriteItems: (cursor: string, limit?: number) =>
      `${BASE_URL}/items?favorite=true&cursor=${cursor}${limit ? `&limit=${limit}` : ''}`,
    getByFeed: (feedId: number, cursor: string, limit?: number) =>
      `${BASE_URL}/feeds/${feedId}/items?cursor=${cursor}${limit ? `&limit=${limit}` : ''}`,
    getUnreadByFeed: (feedId: number, cursor: string, limit?: number) =>
      `${BASE_URL}/feeds/${feedId}/items?read=false&cursor=${cursor}${limit ? `&limit=${limit}` : ''}`,
    getFavoriteByFeed: (feedId: number, cursor: string, limit?: number) =>
      `${BASE_URL}/feeds/${feedId}/items?favorite=true&cursor=${cursor}${limit ? `&limit=${limit}` : ''}`,
    getByCollection: (collectionId: number, cursor: string, limit?: number) =>
      `${BASE_URL}/collections/${collectionId}/items?cursor=${cursor}${limit ? `&limit=${limit}` : ''}`,
    getUnreadByCollection: (collectionId: number, cursor: string, limit?: number) =>
      `${BASE_URL}/collections/${collectionId}/items?read=false&cursor=${cursor}${limit ? `&limit=${limit}` : ''}`,
    getFavoriteByCollection: (collectionId: number, cursor: string, limit?: number) =>
      `${BASE_URL}/collections/${collectionId}/items?favorite=true&cursor=${cursor}${limit ? `&limit=${limit}` : ''}`,
    delete: (id: number) => `${BASE_URL}/items/${id}`,
    markRead: (id: number) => `${BASE_URL}/items/${id}/read`,
    favorite: (id: number) => `${BASE_URL}/items/${id}/favorite`,
  },
}
