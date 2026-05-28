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
import RenameFeedModal from './components/modals/RenameFeedModal.vue'
import { useToast } from 'vue-toastification'
import AddCollectionModal from './components/modals/AddCollectionModal.vue'
import { collectionStore } from './stores/collectionStore'
import DeleteCollectionModal from './components/modals/DeleteCollectionModal.vue'
import type { Feed } from './types/feed'
import type { Collection } from './types/collection'
import RenameCollectionModal from './components/modals/RenameCollectionModal.vue'

useItemSSE()

const toast = useToast()

const {
  activeCollection,
  showAddCollectionModal,
  showDeleteCollectionModal,
  showRenameCollectionModal,
  PostCollectionError,
  loadingPostCollection,
  patchCollectionError,
  loadingPatchCollection,
  deleteCollectionError,
  loadingDeleteCollection,
  handleAddCollection,
  handleDeleteCollection,
  handlePatchCollection,
} = collectionStore()

const {
  activeFeed,
  showAddFeedModal,
  showDeleteFeedModal,
  showRenameFeedModal,
  loadingPostFeed,
  postFeedError,
  loadingDeleteFeed,
  deleteFeedError,
  loadingPatchFeed,
  patchFeedError,
  handleAddFeed,
  handleDeleteFeed,
  handleRefreshFeeds,
  handleRenameFeed,
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

const clearAddModal = () => {
  showAddFeedModal.value = false
  postFeedError.value = null
  showAddCollectionModal.value = false
  PostCollectionError.value = null
}

const clearDeleteModal = () => {
  showDeleteFeedModal.value = false
  deleteFeedError.value = null
  showDeleteCollectionModal.value = false
  deleteCollectionError.value = null
}

const clearRenameModal = () => {
  showRenameFeedModal.value = false
  patchFeedError.value = null
  showRenameCollectionModal.value = false
  patchCollectionError.value = null
}

const handleFeedSelection = (feed: Feed) => {
  activeFeed.value = feed
  activeCollection.value = null
}

const handleCollectionSelection = (collection: Collection) => {
  activeCollection.value = collection
  activeFeed.value = null
}
</script>

<template>
  <div class="app-layout">
    <FeedSideTab
      @selectFeed="handleFeedSelection"
      @selectCollection="handleCollectionSelection"
      @addFeed="showAddFeedModal = true"
      @addCollection="showAddCollectionModal = true"
      @delete="activeFeed ? (showDeleteFeedModal = true) : toast.error('No feed selected')"
      @refresh="handleRefresh"
      @rename="activeFeed ? (showRenameFeedModal = true) : toast.error('No feed selected')"
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
      v-if="showAddFeedModal"
      :loading="loadingPostFeed"
      :error="postFeedError"
      @close="clearAddModal"
      @submit="handleAddFeed"
    />
    <DeleteFeedModal
      v-if="showDeleteFeedModal && activeFeed"
      :feed="activeFeed"
      :loading="loadingDeleteFeed"
      :error="deleteFeedError"
      @close="clearDeleteModal"
      @confirm="handleDeleteFeed"
    />
    <RenameFeedModal
      v-if="showRenameFeedModal && activeFeed"
      :feed="activeFeed"
      :loading="loadingPatchFeed"
      :error="patchFeedError"
      @close="clearRenameModal"
      @submit="handleRenameFeed"
    />
    <AddCollectionModal
      v-if="showAddCollectionModal"
      :collection="activeCollection"
      :loading="loadingPostCollection"
      :error="PostCollectionError"
      @close="clearAddModal"
      @submit="handleAddCollection"
    />
    <DeleteCollectionModal
      v-if="showDeleteCollectionModal && activeCollection"
      :collection="activeCollection"
      :loading="loadingDeleteCollection"
      :error="deleteCollectionError"
      @close="clearDeleteModal"
      @sumbit="handleDeleteCollection"
    />
    <RenameCollectionModal
      v-if="showRenameCollectionModal && activeCollection"
      :collection="activeCollection"
      :loading="loadingPatchCollection"
      :error="patchCollectionError"
      @close="clearRenameModal"
      @submit="handlePatchCollection"
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
