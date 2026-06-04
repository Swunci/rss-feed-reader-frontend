<script setup lang="ts">
import { useCollectionStore } from '@/stores/collectionStore'
import { useFeedStore } from '@/stores/feedStore'
import { useItemStore } from '@/stores/itemStore'
import type { Collection } from '@/types/collection'
import type { Feed } from '@/types/feed'
import RenameCollectionModal from '../modals/RenameCollectionModal.vue'
import DeleteCollectionModal from '../modals/DeleteCollectionModal.vue'
import RenameFeedModal from '../modals/RenameFeedModal.vue'
import DeleteFeedModal from '../modals/DeleteFeedModal.vue'
import CollectionItem from './CollectionItem.vue'
import FeedItem from './FeedItem.vue'

import { BookHeartIcon, EyeOffIcon, LayersIcon } from 'lucide-vue-next'
import { computed, onMounted, ref, watch } from 'vue'
import { VueDraggable, type DraggableEvent, type MoveEvent } from 'vue-draggable-plus'
import {
  DRAG_INTO_COLLECTION_COLOR,
  DRAG_INTO_UNCOLLECTED_COLOR,
  INDENT,
  UNINDENT,
} from '@/constants/dragColors.ts'

const collectionStore = useCollectionStore()
const {
  activeCollection,
  collections,
  expandedCollections,
  loadingDeleteCollection,
  deleteCollectionError,
  PutCollectionError,
  loadingPutCollection,
  collectionFeedsMap,
} = collectionStore

const feedStore = useFeedStore()
const {
  feeds,
  activeFeed,
  feedFilter,
  uncollectedFeeds,
  loadingDeleteFeed,
  deleteFeedError,
  loadingPatchFeed,
  patchFeedError,
  idFeedMap,
} = feedStore

const itemStore = useItemStore()
const { cursor } = itemStore

const showDeleteCollectionModal = ref(false)
const showRenameCollectionModal = ref(false)

const showDeleteFeedModal = ref(false)
const showRenameFeedModal = ref(false)

const filterConfig = {
  all: { label: 'All Feeds', icon: LayersIcon },
  unread: { label: 'All Unread', icon: EyeOffIcon },
  favorite: { label: 'All Favorites', icon: BookHeartIcon },
} as const

const collectionCounts = computed(() => {
  const counts: Record<number, number> = {}
  for (const [collectionId, feeds] of Object.entries(collectionFeedsMap.value)) {
    counts[Number(collectionId)] = feeds.reduce((sum, f) => sum + (f.count ?? 0), 0)
  }
  return counts
})

const handleSelectAll = () => {
  activeFeed.value = null
  activeCollection.value = null
}

const handleFeedSelection = (feed: Feed) => {
  activeFeed.value = feed
  activeCollection.value = null
  const collectionId = idFeedMap.value[feed.id]?.collectionId
  if (collectionId !== null && collectionId !== undefined) {
    collectionStore.expandCollection(collectionId)
  }
}

const handleToggleCollection = (collectionId: number) => {
  collectionStore.toggleCollection(collectionId)
}

const handleCollectionSelection = (collection: Collection) => {
  activeCollection.value = collection
  activeFeed.value = null
}

const handleMoveIntoCollection = async (e: DraggableEvent, collectionId: number) => {
  const feedId = Number(e.item.dataset.id)
  if (
    (await feedStore.moveFeedIntoCollection(feedId, collectionId)) &&
    activeCollection.value?.id == collectionId
  ) {
    itemStore.resetItems()
    await itemStore.getItemsFromAPI(
      activeFeed.value,
      activeCollection.value,
      feedFilter.value,
      cursor.value,
    )
    itemStore.appendNewItems()
  }
}

const handleMoveOutOfCollection = async (e: DraggableEvent) => {
  const feedId = Number(e.item.dataset.id)
  const collectionId = Number(e.from.dataset.collectionId)
  if (
    (await feedStore.moveFeedOutOfCollection(feedId)) &&
    activeCollection.value?.id == collectionId
  ) {
    itemStore.resetItems()
    await itemStore.getItemsFromAPI(
      activeFeed.value,
      activeCollection.value,
      feedFilter.value,
      cursor.value,
    )
    itemStore.appendNewItems()
  }
}

const clearModals = () => {
  showDeleteFeedModal.value = false
  deleteFeedError.value = null
  showDeleteCollectionModal.value = false
  deleteCollectionError.value = null
  showRenameFeedModal.value = false
  patchFeedError.value = null
  showRenameCollectionModal.value = false
  PutCollectionError.value = null
}

type ModalType = 'rename' | 'delete'

function openFeedModal(feed: Feed, type: ModalType) {
  collectionStore.activeCollection.value = null
  feedStore.activeFeed.value = feed
  if (type === 'rename') showRenameFeedModal.value = true
  else showDeleteFeedModal.value = true
}

function openCollectionModal(collection: Collection, type: ModalType) {
  feedStore.activeFeed.value = null
  collectionStore.activeCollection.value = collection
  if (type === 'rename') showRenameCollectionModal.value = true
  else showDeleteCollectionModal.value = true
}

const handleDeleteFeed = async (feedId: number) => {
  if (await feedStore.removeFeed(feedId)) {
    showDeleteFeedModal.value = false
  }
}

const handleRenameFeed = async (feedId: number, name: string) => {
  if (await feedStore.renameFeed(feedId, name)) {
    showRenameFeedModal.value = false
  }
}

const handleDeleteCollection = async (collectionId: number) => {
  if (await collectionStore.removeCollection(collectionId)) {
    showDeleteCollectionModal.value = false
    await feedStore.fetchFilteredFeeds()
  }
}

const handleRenameCollection = async (collectionId: number, name: string) => {
  if (await collectionStore.updateCollection(collectionId, name)) {
    showRenameCollectionModal.value = false
  }
}

watch(
  [feeds, collections],
  () => {
    uncollectedFeeds.value =
      feeds.value
        ?.filter((f) => f.collectionId == null)
        .sort((a, b) => a.name.localeCompare(b.name)) ?? []
    collectionFeedsMap.value =
      collections.value?.reduce(
        (acc, collection) => {
          acc[collection.id] = feeds.value?.filter((f) => f.collectionId === collection.id) ?? []
          return acc
        },
        {} as Record<number, Feed[]>,
      ) ?? {}
  },
  { immediate: true },
)

const uncollectedRef = ref()

onMounted(() => {
  uncollectedRef.value?.$el.addEventListener('dragover', () => {
    const ghost = document.querySelector('.drag-ghost-uncollected') as HTMLElement
    if (!ghost) return
    ghost.style.paddingLeft = UNINDENT
    ghost.style.background = DRAG_INTO_UNCOLLECTED_COLOR
  })
})

const sortedCollections = computed(() =>
  [...(collections.value ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
)

const onMoveFromUncollected = (e: MoveEvent) => {
  if (e.related.classList.contains('collection-header') && e.willInsertAfter === false) {
    return false
  }
  const ghost = document.querySelector('.drag-ghost-uncollected') as HTMLElement

  if (!ghost) return true
  console.log('e.from:', e.from.classList)
  console.log('e.to:', e.to.classList)
  if (e.to.classList.contains('draggable-area')) {
    ghost.style.paddingLeft = INDENT
    ghost.style.background = DRAG_INTO_COLLECTION_COLOR
  } else {
    ghost.style.paddingLeft = UNINDENT
    ghost.style.background = DRAG_INTO_UNCOLLECTED_COLOR
  }
  return true
}
</script>

<template>
  <div
    :class="['feed-item', !activeCollection && !activeFeed ? 'active' : '']"
    @click="handleSelectAll"
  >
    <component :is="filterConfig[feedFilter].icon" :size="14" />
    <span class="feed-name">{{ filterConfig[feedFilter].label }}</span>
  </div>
  <div class="collection-list">
    <CollectionItem
      v-for="collection in sortedCollections"
      :key="collection.id"
      :collection="collection"
      v-model:feeds="collectionFeedsMap[collection.id]!"
      :expanded="expandedCollections.has(collection.id)"
      :active="activeCollection?.id === collection.id"
      :count="collectionCounts[collection.id] ?? 0"
      :activeFeed="activeFeed"
      @select="handleCollectionSelection"
      @rename="(c) => openCollectionModal(c, 'rename')"
      @delete="(c) => openCollectionModal(c, 'delete')"
      @select-feed="handleFeedSelection"
      @rename-feed="(f) => openFeedModal(f, 'rename')"
      @delete-feed="(f) => openFeedModal(f, 'delete')"
      @feed-added="handleMoveIntoCollection"
      @toggle-collection="handleToggleCollection"
    />
    <VueDraggable
      v-model="uncollectedFeeds"
      ref="uncollectedRef"
      :sort="false"
      group="feeds"
      class="feed-list"
      ghost-class="drag-ghost-uncollected"
      :animation="150"
      @move="onMoveFromUncollected"
      @add="(e) => handleMoveOutOfCollection(e)"
    >
      <FeedItem
        v-for="feed in uncollectedFeeds"
        :key="feed.id"
        :feed="feed"
        :active="activeFeed?.id === feed.id"
        @select="handleFeedSelection"
        @rename="(f) => openFeedModal(f, 'rename')"
        @delete="(f) => openFeedModal(f, 'delete')"
      />
    </VueDraggable>
  </div>
  <DeleteCollectionModal
    v-if="showDeleteCollectionModal && activeCollection"
    :collection="activeCollection"
    :loading="loadingDeleteCollection"
    :error="deleteCollectionError"
    @close="clearModals"
    @submit="handleDeleteCollection"
  />
  <RenameCollectionModal
    v-if="showRenameCollectionModal && activeCollection"
    :collection="activeCollection"
    :loading="loadingPutCollection"
    :error="PutCollectionError"
    @close="clearModals"
    @submit="handleRenameCollection"
  />
  <DeleteFeedModal
    v-if="showDeleteFeedModal && activeFeed"
    :feed="activeFeed"
    :loading="loadingDeleteFeed"
    :error="deleteFeedError"
    @close="clearModals"
    @submit="handleDeleteFeed"
  />
  <RenameFeedModal
    v-if="showRenameFeedModal && activeFeed"
    :feed="activeFeed"
    :loading="loadingPatchFeed"
    :error="patchFeedError"
    @close="clearModals"
    @submit="handleRenameFeed"
  />
</template>

<style scoped>
.feed-list {
  overflow-y: auto;
  min-height: 40px;
  display: flex;
  flex-direction: column;
}

.feed-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-size: 13px;
  color: #111827;
  transition: background 0.15s;
  width: 100%;
  height: 40px;
}
.feed-item:hover {
  background: #f3f4f6;
}
.feed-item.active {
  background: #f3f4f6;
}
.feed-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.collection-list {
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
</style>
