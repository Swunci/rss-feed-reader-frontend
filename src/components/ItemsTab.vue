<script setup lang="ts">
import { CheckCheckIcon, SearchIcon } from 'lucide-vue-next'
import ActionsBar from './ActionsBar.vue'
import type { Item } from '@/types/item'
import { formatRelativeTime } from '@/utils/date'
import { LoaderCircleIcon } from 'lucide-vue-next'

import { useItemStore } from '@/stores/itemStore'
import { useFeedStore } from '@/stores/feedStore'
import { vInfiniteScroll } from '@vueuse/components'
import { computed, onMounted, ref, watch } from 'vue'
import { refDebounced } from '@vueuse/core'
import Fuse from 'fuse.js'
import { useCollectionStore } from '@/stores/collectionStore'
import { useItemSSE } from '@/composables/api/useItemSSE.ts'
import { useToast } from 'vue-toastification'

const toast = useToast()

const feedStore = useFeedStore()
const { activeFeed, feedFilter, collectionsFeedMap } = feedStore

const { activeCollection } = useCollectionStore()

const itemStore = useItemStore()
const { items, activeItem, hasMore, itemsLoading, cursor } = itemStore

const { itemEvent } = useItemSSE()

const searchQuery = ref('')

const debouncedQuery = refDebounced(searchQuery, 500)

const filteredItems = computed(() => {
  if (debouncedQuery.value.trim().length === 0) return items.value
  const fuse = new Fuse(items.value, {
    keys: ['title', 'description'],
    threshold: 0.3,
    ignoreLocation: true,
  })
  return fuse.search(debouncedQuery.value).map((result) => result.item)
})

const activeSelection = computed(() => activeFeed.value ?? activeCollection.value)

watch([activeSelection, feedFilter], async () => {
  items.value = []
  cursor.value = ''
  hasMore.value = true
  activeItem.value = null
  await itemStore.getItemsFromAPI(
    activeFeed.value,
    activeCollection.value,
    feedFilter.value,
    cursor.value,
  )
  itemStore.appendNewItems()
})

watch(itemEvent, async () => {
  const newEventFeedId = itemEvent.value?.feedId

  if (
    newEventFeedId === activeFeed.value?.id ||
    (!activeCollection && !activeFeed) ||
    isInActiveCollection(newEventFeedId)
  ) {
    await itemStore.getItemsFromAPI(activeFeed.value, activeCollection.value, feedFilter.value, '')
    itemStore.mergeNewItems()
  }
})

onMounted(async () => {
  await itemStore.getItemsFromAPI(activeFeed.value, activeCollection.value, feedFilter.value, '')
  itemStore.appendNewItems()
})

function isInActiveCollection(feedId: number | undefined): boolean {
  if (!activeCollection.value || !feedId) return false
  return collectionsFeedMap.value[activeCollection.value.id]?.some((f) => f.id === feedId) ?? false
}

const loadMore = async () => {
  if (itemsLoading.value) return
  await itemStore.getItemsFromAPI(
    activeFeed.value,
    activeCollection.value,
    feedFilter.value,
    cursor.value,
  )
  itemStore.appendNewItems()
}

const handleSelectItem = async (item: Item) => {
  const wasRead = item.isRead
  if (!wasRead && feedFilter.value === 'unread') {
    feedStore.updateFeedItemCount(item.feedId, -1)
  }
  await itemStore.selectItem(item)
  if (!item.isRead && !wasRead && feedFilter.value === 'unread') {
    feedStore.updateFeedItemCount(item.feedId, 1)
  }
}

const handleMarkAllRead = async () => {
  if (activeFeed.value == null) return
  const count = activeFeed.value.count
  if (feedFilter.value === 'unread') feedStore.updateFeedItemCount(activeFeed.value.id, -count)

  const { success } = await itemStore.markAllRead()
  if (!success) {
    toast.error('Failed to mark all as read')
    if (feedFilter.value === 'unread') feedStore.updateFeedItemCount(activeFeed.value.id, count)
  }
}
</script>

<template>
  <div class="items-tab">
    <ActionsBar>
      <label class="search-row">
        <SearchIcon :size="14" class="search-icon" />
        <input class="search-input" type="text" placeholder="Search…" v-model="searchQuery" />
      </label>
      <button class="icon-btn" @click="handleMarkAllRead" title="Mark all read">
        <CheckCheckIcon :size="25" />
      </button>
    </ActionsBar>
    <div
      class="items-list"
      v-infinite-scroll="[loadMore, { distance: 200, canLoadMore: () => hasMore }]"
    >
      <div
        v-for="item in filteredItems"
        :key="item.id"
        :class="['news-item', activeItem?.id === item.id ? 'active' : '']"
        @click="handleSelectItem(item)"
      >
        <div class="news-item-inner">
          <span v-if="item.isFavorite" class="favorite-star" />
          <span v-else-if="!item.isRead" class="unread-dot" />
          <p :class="['news-title', !item.isRead ? 'unread' : 'read']">{{ item.title }}</p>
        </div>
        <p class="news-date">{{ formatRelativeTime(item.publishedAt) }}</p>
      </div>
      <div v-if="itemsLoading" class="scroll-status">
        <LoaderCircleIcon :size="30" class="spinner" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.items-tab {
  display: flex;
  flex-direction: column;
  width: 20%;
  min-width: 200px;
  height: 100%;
  border-right: 1px solid #e5e7eb;
  flex-shrink: 0;
}
.items-list {
  flex: 1;
  overflow-y: auto;
}
.news-item {
  padding: 10px 12px;
  border-bottom: 1px solid #e5e7eb;
  cursor: pointer;
  transition: background 0.15s;
}
.news-item:hover {
  background: #f3f4f6;
}
.news-item.active {
  background: #f3f4f6;
}
.news-item-inner {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}
.unread-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #3b82f6;
  flex-shrink: 0;
  margin-top: 5px;
}
.favorite-star {
  width: 8px;
  height: 8px;
  background: #f59e0b;
  flex-shrink: 0;
  margin-top: 4px;
  clip-path: polygon(
    50% 0%,
    61% 35%,
    98% 35%,
    68% 57%,
    79% 91%,
    50% 70%,
    21% 91%,
    32% 57%,
    2% 35%,
    39% 35%
  );
}
.news-title {
  font-size: 13px;
  line-height: 1.4;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.news-title.unread {
  color: #111827;
  font-weight: 500;
}
.news-title.read {
  color: #6b7280;
}
.news-date {
  font-size: 11px;
  color: #9ca3af;
  margin: 4px 0 0;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Spinner and text layout wrapper */
.scroll-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px; /* Spaces the icon out from the text */
  font-size: 11px;
  color: #6b7280;
  padding: 12px 0;
  margin: 0;
}

/* Apply the keyframe animation to the Lucide icon */
.spinner {
  animation: spin 1s linear infinite;
  color: #3b82f6; /* Optional: sets the loading circle to a nice blue */
}

.search-row {
  display: flex;
  align-items: center;
  min-width: 0;
  width: 100%;
  gap: 0.4rem;
  padding: 0.4rem 0.5rem;
}

.search-icon {
  color: #9ca3af;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-size: 12px;
  color: #111827;
}

.search-input::placeholder {
  color: #9ca3af;
}
</style>
