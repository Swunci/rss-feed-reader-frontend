<script setup lang="ts">
import FeedSideTab from './components/FeedsTab.vue'
import ItemsTab from './components/ItemsTab.vue'
import ItemContent from './components/ItemContent.vue'
import './styles/shared.css'
import AddFeedModal from './components/modals/AddFeedModal.vue'
import DeleteFeedModal from './components/modals/DeleteFeedModal.vue'
import { itemStore } from './stores/itemStore'
import { feedStore } from './stores/feedStore'
import { useItemSSE } from './composables/api/useItemSSE'

useItemSSE()

const {
  activeFeed,
  showAddModal,
  showDeleteModal,
  loadingFeed,
  feedError,
  loadingDeleteFeed,
  deleteFeedError,
  handleAddFeed,
  handleDeleteFeed,
  handleRefreshFeeds,
  viewAll,
  viewUnread,
  viewFavorites,
} = feedStore()

const {
  activeItem,
  handleMarkReadItem,
  handleFavoriteItem,
  handleSelectItem,
  handleMarkAllRead,
  handleRefreshItems,
  handleOpenLink,
  loadMore,
} = itemStore()

const handleRefresh = () => {
  handleRefreshFeeds()
  handleRefreshItems()
}
</script>

<template>
  <div class="app-layout">
    <FeedSideTab
      @select="activeFeed = $event"
      @add="showAddModal = true"
      @delete="activeFeed && (showDeleteModal = true)"
      @refresh="handleRefresh"
      @all="viewAll"
      @unread="viewUnread"
      @favorite="viewFavorites"
    />
    <ItemsTab @select="handleSelectItem" @markAllRead="handleMarkAllRead" @loadMore="loadMore" />
    <ItemContent
      v-if="activeItem"
      :item="activeItem"
      :feedName="activeFeed!.name"
      @markRead="handleMarkReadItem"
      @favorite="handleFavoriteItem"
      @openLink="handleOpenLink"
    />
    <AddFeedModal
      v-if="showAddModal"
      :loading="loadingFeed"
      :error="feedError"
      @close="showAddModal = false"
      @submit="handleAddFeed"
    />
    <DeleteFeedModal
      v-if="showDeleteModal && activeFeed"
      :feed="activeFeed"
      :loading="loadingDeleteFeed"
      :error="deleteFeedError"
      @close="showDeleteModal = false"
      @confirm="handleDeleteFeed"
    />
  </div>
</template>

<style>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #fff;
  color: #111827;
}

.app-layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
}
</style>
