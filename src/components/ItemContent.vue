<script setup lang="ts">
import {
  CircleCheckIcon,
  CircleMinusIcon,
  ExternalLinkIcon,
  HeartPlusIcon,
  HeartMinusIcon,
} from 'lucide-vue-next'
import ActionsBar from './ActionsBar.vue'
import { formatDate } from '@/utils/date'
import { computed } from 'vue'
import { fixLinks } from '@/utils/html'
import { useItemStore } from '@/stores/itemStore'
import { useFeedStore } from '@/stores/feedStore'
import type { Feed } from '@/types/feed.ts'
import { useCollectionStore } from '@/stores/collectionStore.ts'

const itemStore = useItemStore()
const { activeItem } = itemStore

const feedStore = useFeedStore()
const { activeFeed, feeds, feedFilter, idFeedMap } = feedStore

const collectionStore = useCollectionStore()
const { activeCollection } = collectionStore

const safeHtml = computed(() => {
  if (activeItem.value) {
    return fixLinks(activeItem.value.description)
  }
  return ''
})

const feed = computed(() => {
  return feeds.value?.find((f) => f.id == activeItem.value?.feedId)
})

const handleOpenLink = () => {
  if (activeItem.value != null) window.open(activeItem.value.link, '_blank', 'noopener,noreferrer')
}

async function handleMarkReadItem() {
  if (activeItem.value == null) return
  const wasRead = activeItem.value.isRead
  if (feedFilter.value === 'unread') {
    feedStore.updateFeedItemCount(activeItem.value.feedId, wasRead ? 1 : -1)
  }
  const success = await itemStore.markItemRead()
  if (!success && feedFilter.value === 'unread') {
    feedStore.updateFeedItemCount(activeItem.value.feedId, wasRead ? -1 : 1)
  }
}

const handleFavoriteItem = async () => {
  if (activeItem.value == null) return
  const wasFavorite = activeItem.value.isFavorite
  if (feedFilter.value === 'favorite')
    feedStore.updateFeedItemCount(activeItem.value.feedId, wasFavorite ? -1 : 1)

  const success = await itemStore.toggleFavorite()
  if (!success && feedFilter.value === 'favorite')
    feedStore.updateFeedItemCount(activeItem.value.feedId, wasFavorite ? 1 : -1)
}

const handleFeedSelection = (feed: Feed | undefined) => {
  if (feed) {
    activeFeed.value = feed
    activeCollection.value = null
    const collectionId = idFeedMap.value[activeFeed.value.id]?.collectionId
    if (collectionId !== null && collectionId !== undefined) {
      collectionStore.expandCollection(collectionId)
    }
  }
}
</script>

<template>
  <div class="item-content-tab">
    <ActionsBar>
      <div class="actions-group">
        <button class="icon-btn" @click="handleFavoriteItem" title="Favorite">
          <HeartPlusIcon v-if="!activeItem!.isFavorite" />
          <HeartMinusIcon v-else />
        </button>
        <button
          class="icon-btn"
          @click="handleMarkReadItem"
          :title="activeItem!.isRead ? 'Mark as unread' : 'Mark as read'"
        >
          <CircleCheckIcon v-if="!activeItem!.isRead" />
          <CircleMinusIcon v-else />
        </button>
        <button class="icon-btn" @click="handleOpenLink" title="Open link">
          <ExternalLinkIcon />
        </button>
      </div>
    </ActionsBar>
    <div class="scroll-container">
      <div class="content-wrapper">
        <h1>
          <b>{{ activeItem!.title }}</b>
        </h1>
        <span class="feed-name" @click.stop="handleFeedSelection(feed)">
          {{ feed?.name }}
        </span>
        <div>{{ formatDate(activeItem!.publishedAt) }}</div>
        <hr />
        <div class="description" v-html="safeHtml"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.item-content-tab {
  display: flex;
  flex-direction: column;
  min-width: 200px;
  height: 100%;
  border-right: 1px solid #e5e7eb;
  flex-shrink: 1;
  flex-grow: 1;
}

.scroll-container {
  flex: 1;
  overflow-y: auto;
}

.content-wrapper {
  max-width: 1000px;
  margin: 0 auto;
  padding: 0rem 0.5rem;
}

.actions-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 6px;
  padding: 2px;
}

.feed-name {
  font-size: 16px;
  color: #9ca3af;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  margin-bottom: 2px;
}
.feed-name:hover {
  color: #6b7280;
}
.description {
  white-space: pre-wrap;
}
</style>
