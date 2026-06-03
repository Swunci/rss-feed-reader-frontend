<script setup lang="ts">
import { ChevronsRightIcon, SquarePenIcon, TrashIcon } from 'lucide-vue-next'
import { VueDraggable, type DraggableEvent, type MoveEvent } from 'vue-draggable-plus'
import type { Collection } from '@/types/collection'
import type { Feed } from '@/types/feed'
import FeedItem from './FeedItem.vue'

defineProps<{
  collection: Collection
  feeds: Feed[]
  expanded: boolean
  active: boolean
  count: number
  activeFeed: Feed | null
}>()

const emit = defineEmits<{
  select: [collection: Collection]
  rename: [collection: Collection]
  delete: [collection: Collection]
  selectFeed: [feed: Feed]
  renameFeed: [feed: Feed]
  deleteFeed: [feed: Feed]
  feedAdded: [e: DraggableEvent, collectionId: number]
}>()

const localFeeds = defineModel<Feed[]>('feeds', { default: () => [] })

const onMove = (e: MoveEvent) => {
  const ghost = document.querySelector('.drag-ghost') as HTMLElement
  if (!ghost) return true
  console.log('e.to classes:', e.to.classList)
  if (e.to.classList.contains('feed-list')) {
    ghost.style.paddingLeft = '0.75rem'
    ghost.style.background = 'red'
  } else {
    ghost.style.paddingLeft = '2rem'
    ghost.style.background = 'rgb(121, 239, 255)'
  }
  return true
}
</script>

<template>
  <div class="collection-item">
    <VueDraggable
      v-model="localFeeds"
      :sort="false"
      :data-collection-id="collection.id"
      :swap-threshold="0.1"
      filter=".collection-header"
      :prevent-on-filter="true"
      :invert-swap="true"
      group="feeds"
      @move="onMove"
      ghost-class="drag-ghost"
      class="draggable-area"
      @add="(e) => emit('feedAdded', e, collection.id)"
    >
      <div
        :class="['collection-header', active ? 'active' : '']"
        @click="emit('select', collection)"
      >
        <ChevronsRightIcon :size="14" :class="['collection-chevron', expanded ? 'expanded' : '']" />
        <span class="collection-name">{{ collection.name }}</span>
        <span class="feed-count">{{ count }}</span>
        <div class="actions" @click.stop>
          <span class="rename-btn" @click.stop="emit('rename', collection)">
            <SquarePenIcon :size="14" />
          </span>
          <span class="delete-btn" @click.stop="emit('delete', collection)">
            <TrashIcon :size="14" />
          </span>
        </div>
      </div>
      <template v-if="expanded">
        <FeedItem
          v-for="feed in feeds"
          :key="feed.id"
          :feed="feed"
          :active="activeFeed?.id === feed.id"
          :indented="true"
          @select="emit('selectFeed', feed)"
          @rename="emit('renameFeed', feed)"
          @delete="emit('deleteFeed', feed)"
        />
      </template>
    </VueDraggable>
  </div>
</template>

<style lang="css" scoped>
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
  height: 40px;
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
  height: 100%;
  align-content: center;
}
.collection-chevron {
  color: #9ca3af;
  flex-shrink: 0;
  transition: transform 0.15s;
}
.collection-chevron.expanded {
  transform: rotate(90deg);
}
.collection-header .actions {
  display: none;
}
.collection-header:hover .actions {
  display: flex;
}
.draggable-area {
  width: 100%;
  height: 100%;
}
.actions {
  display: none;
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem;
  border-radius: 4px;
  color: #9ca3af;
}
.delete-btn {
  display: flex;
  align-items: center;
}
.delete-btn:hover {
  color: #ef4444;
}
.rename-btn {
  display: flex;
  align-items: center;
}
.rename-btn:hover {
  color: #111827;
}
</style>
