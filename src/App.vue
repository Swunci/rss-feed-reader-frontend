<script setup lang="ts">
import FeedsTab from './components/FeedsTab/FeedsTab.vue'
import ItemsTab from './components/ItemsTab.vue'
import ItemContent from './components/ItemContent.vue'
import './styles/shared.css'
import AddFeedModal from './components/modals/AddFeedModal.vue'
import { useItemStore } from './stores/itemStore'
import { useFeedStore } from './stores/feedStore'
import { useItemSSE } from './composables/api/useItemSSE'
import AddCollectionModal from './components/modals/AddCollectionModal.vue'
import { useCollectionStore } from './stores/collectionStore'
import { ref, watch } from 'vue'

useItemSSE()

const collectionStore = useCollectionStore()
const { activeCollection, PostCollectionError, loadingPostCollection } = collectionStore

const feedStore = useFeedStore()
const {
  feeds,
  activeFeed,
  loadingPostFeed,
  postFeedError,
  feedFilter,
  discoveredFeeds,
  discoverLoading,
  discoverError,
} = feedStore

const itemStore = useItemStore()
const { activeItem, hasMore, items, cursor } = itemStore

const showAddCollectionModal = ref(false)

const showAddFeedModal = ref(false)
const showDiscoverFeedOptions = ref(false)

const handleRefresh = async () => {
  const success = await feedStore.refreshFeeds()
  if (success) {
    await handleRefreshItems()
  }
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
  showDiscoverFeedOptions.value = false
  discoverError.value = null
}

const handleAddCollection = async (name: string) => {
  if (await collectionStore.addCollection(name)) {
    showAddCollectionModal.value = false
  }
}

const handleSubmitFeed = async (url: string) => {
  await feedStore.discoverFeeds(url)
  if (discoveredFeeds.value && discoveredFeeds.value.length > 0) {
    showDiscoverFeedOptions.value = true
  } else {
    await handleAddFeed(url)
  }
}

const handleAddFeed = async (url: string, name: string = '') => {
  if (await feedStore.addFeed(url, name)) {
    showAddFeedModal.value = false
    showDiscoverFeedOptions.value = false
    activeFeed.value = feeds.value?.find((f) => f.url == url) ?? activeFeed.value
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
      @add-feed="showAddFeedModal = true"
      @add-collection="showAddCollectionModal = true"
      @refresh="handleRefresh"
    />
    <ItemsTab />
    <ItemContent v-if="activeItem" />
    <AddFeedModal
      v-if="showAddFeedModal"
      :loading-post-feed="loadingPostFeed"
      :post-feed-error="postFeedError"
      :loading-discover-options="discoverLoading"
      :discover-error="discoverError"
      :show-options="showDiscoverFeedOptions"
      :discovered-feeds="discoveredFeeds ?? []"
      @close="clearAddModal"
      @add="handleAddFeed"
      @submit="handleSubmitFeed"
    />
    <AddCollectionModal
      v-if="showAddCollectionModal"
      :collection="activeCollection"
      :loading="loadingPostCollection"
      :error="PostCollectionError"
      @close="clearAddModal"
      @submit="handleAddCollection"
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
