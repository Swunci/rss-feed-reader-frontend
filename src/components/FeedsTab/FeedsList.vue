<script setup lang="ts">
import { useCollectionStore } from '@/stores/collectionStore'
import { useFeedStore } from '@/stores/feedStore'
import { useItemStore } from '@/stores/itemStore'
import type { Collection } from '@/types/collection'
import type { Feed } from '@/types/feed'
import { BookHeartIcon, EyeOffIcon, LayersIcon, ChevronsRightIcon, RssIcon } from 'lucide-vue-next'
import { computed, watch } from 'vue'
import { VueDraggable, type DraggableEvent } from 'vue-draggable-plus'

const collectionStore = useCollectionStore()
const { activeCollection, collections, expandedCollections, collectionsFeedMap } = collectionStore

const feedStore = useFeedStore()
const { activeFeed, feeds, feedFilter, uncollectedFeeds, idFeedMap } = feedStore

const itemStore = useItemStore()
const { cursor } = itemStore

const filterConfig = {
  all: { label: 'All Feeds', icon: LayersIcon },
  unread: { label: 'All Unread', icon: EyeOffIcon },
  favorite: { label: 'All Favorites', icon: BookHeartIcon },
} as const

const collectionCounts = computed(() => {
  const counts: Record<number, number> = {}
  for (const [collectionId, feeds] of Object.entries(collectionsFeedMap.value)) {
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
}

const handleCollectionSelection = (collection: Collection) => {
  collectionStore.toggleCollection(collection.id)
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
  const feedId = uncollectedFeeds.value[e.newIndex!]!.id
  const collectionId = Number(e.from.dataset.collectionId)
  console.log(collectionId + ' asdfasdf')
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

watch(
  [feeds, collections],
  () => {
    uncollectedFeeds.value = feeds.value?.filter((f) => f.collectionId == null) ?? []
    collectionsFeedMap.value =
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

watch(activeFeed, () => {
  if (activeFeed.value != null) {
    const collectionId = idFeedMap.value[activeFeed.value.id]?.collectionId
    console.log(collectionId)
    if (collectionId != null) {
      collectionStore.expandCollection(collectionId)
    }
  }
})
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
    <div v-for="collection in collections" :key="collection.id" class="collection-item">
      <div
        :class="['collection-header', activeCollection?.id === collection.id ? 'active' : '']"
        @click="handleCollectionSelection(collection)"
      >
        <ChevronsRightIcon
          :size="14"
          :class="['collection-chevron', expandedCollections.has(collection.id) ? 'expanded' : '']"
        />
        <span class="collection-name">{{ collection.name }}</span>
        <span class="feed-count">{{ collectionCounts[collection.id] }}</span>
      </div>
      <VueDraggable
        v-model="collectionsFeedMap[collection.id]!"
        :sort="false"
        :data-collection-id="collection.id"
        group="feeds"
        class="draggable-area"
        @add="(e) => handleMoveIntoCollection(e, collection.id)"
      >
        <template v-if="expandedCollections.has(collection.id)">
          <div
            v-for="feed in collectionsFeedMap[collection.id]"
            :key="feed.id"
            :data-id="feed.id"
            :class="['feed-item', 'indented', activeFeed?.id === feed.id ? 'active' : '']"
            @click="handleFeedSelection(feed)"
          >
            <RssIcon :size="14" class="feed-icon" />
            <span class="feed-name">{{ feed.name }}</span>
            <span class="feed-count">{{ feed.count }}</span>
          </div>
        </template>
      </VueDraggable>
    </div>
    <VueDraggable
      v-model="uncollectedFeeds"
      :sort="false"
      group="feeds"
      class="feed-list"
      @add="(e) => handleMoveOutOfCollection(e)"
    >
      <div
        v-for="feed in uncollectedFeeds"
        :key="feed.id"
        :data-id="feed.id"
        :class="['feed-item', activeFeed?.id === feed.id ? 'active' : '']"
        @click="handleFeedSelection(feed)"
      >
        <RssIcon :size="14" class="feed-icon" />
        <span class="feed-name">{{ feed.name }}</span>
        <span class="feed-count">{{ feed.count }}</span>
      </div>
    </VueDraggable>
  </div>
</template>

<style scoped>
css.feed-list {
  overflow-y: auto;
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
}
.feed-item:hover {
  background: #f3f4f6;
}
.feed-item.active {
  background: #f3f4f6;
}
.feed-item.indented {
  padding-left: 2rem;
}
.feed-icon {
  color: #9ca3af;
  flex-shrink: 0;
}
.feed-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.collection-list {
  overflow-y: auto;
}
.collection-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  font-size: 13px;
  color: #111827;
  transition: background 0.15s;
}
.collection-header {
  display: flex;
  align-items: center;
  flex-direction: row;
  cursor: pointer;
  font-size: 13px;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  width: 100%;
}
.collection-header:hover {
  background: #f3f4f6;
}
.collection-header.active {
  background: #f3f4f6;
}
.collection-name {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.collection-icon {
  color: #9ca3af;
  flex-shrink: 0;
}
.collection-chevron {
  color: #9ca3af;
  flex-shrink: 0;
  transition: transform 0.15s;
}
.collection-chevron.expanded {
  transform: rotate(90deg);
}
.draggable-area {
  width: 100%;
  height: 100%;
}
</style>
