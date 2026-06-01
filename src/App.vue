<script setup lang="ts">
import FeedsTab from './components/FeedsTab/FeedsTab.vue'
import ItemsTab from './components/ItemsTab.vue'
import ItemContent from './components/ItemContent.vue'
import './styles/shared.css'
import AddFeedModal from './components/modals/AddFeedModal.vue'
import DeleteFeedModal from './components/modals/DeleteFeedModal.vue'
import { useItemStore } from './stores/itemStore'
import { useFeedStore } from './stores/feedStore'
import { useItemSSE } from './composables/api/useItemSSE'
import RenameFeedModal from './components/modals/RenameFeedModal.vue'
import { useToast } from 'vue-toastification'
import AddCollectionModal from './components/modals/AddCollectionModal.vue'
import { useCollectionStore } from './stores/collectionStore'
import DeleteCollectionModal from './components/modals/DeleteCollectionModal.vue'
import RenameCollectionModal from './components/modals/RenameCollectionModal.vue'
import { ref, watch } from 'vue'

useItemSSE()

const toast = useToast()

const collectionStore = useCollectionStore()
const {
  activeCollection,
  PostCollectionError,
  loadingPostCollection,
  patchCollectionError,
  loadingPatchCollection,
  deleteCollectionError,
  loadingDeleteCollection,
} = collectionStore

const feedStore = useFeedStore()
const {
  activeFeed,
  loadingPostFeed,
  postFeedError,
  loadingDeleteFeed,
  deleteFeedError,
  loadingPatchFeed,
  patchFeedError,
  feedFilter,
} = feedStore

const itemStore = useItemStore()
const { activeItem, hasMore, items, cursor } = itemStore

const showAddCollectionModal = ref(false)
const showDeleteCollectionModal = ref(false)
const showRenameCollectionModal = ref(false)

const showAddFeedModal = ref(false)
const showDeleteFeedModal = ref(false)
const showRenameFeedModal = ref(false)

const handleRefresh = async () => {
  await feedStore.refreshFeeds()
  handleRefreshItems()
}

const handleRefreshItems = async () => {
  cursor.value = ''
  items.value = []
  hasMore.value = true
  await itemStore.getItemsFromAPI(
    activeFeed.value,
    activeCollection.value,
    feedFilter.value,
    cursor.value,
  )
  itemStore.appendNewItems()
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

const handleAddCollection = async (name: string) => {
  if (await collectionStore.addCollection(name)) {
    showAddCollectionModal.value = false
  }
}

const handleDeleteCollection = async (collectionId: number) => {
  if (await collectionStore.removeCollection(collectionId)) {
    showDeleteCollectionModal.value = false
  }
}

const handleRenameCollection = async (collectionId: number, name: string) => {
  if (await collectionStore.updateCollection(collectionId, name)) {
    showRenameCollectionModal.value = false
  }
}

const handleAddFeed = async (url: string) => {
  if (await feedStore.addFeed(url)) {
    showAddFeedModal.value = false
  }
}

const handleDeleteFeed = async (feedId: number) => {
  if (await feedStore.removeFeed(feedId)) {
    showDeleteFeedModal.value = false
  }
}

const handleRenameFeed = async (feedId: number, name: string) => {
  if (await feedStore.renameFeed(feedId, name)) {
    showDeleteFeedModal.value = false
  }
}

const { itemEvent } = useItemSSE()

watch(itemEvent, async () => {
  console.log('Updating feeds counts')
  await feedStore.fetchFilteredFeeds()
})
</script>

<template>
  <div class="app-layout">
    <FeedsTab
      @addFeed="showAddFeedModal = true"
      @addCollection="showAddCollectionModal = true"
      @deleteFeed="activeFeed ? (showDeleteFeedModal = true) : toast.error('No feed selected')"
      @refresh="handleRefresh"
      @rename="activeFeed ? (showRenameFeedModal = true) : toast.error('No feed selected')"
    />
    <ItemsTab />
    <ItemContent v-if="activeItem" />
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
      @submit="handleDeleteFeed"
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
      @submit="handleRenameCollection"
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
