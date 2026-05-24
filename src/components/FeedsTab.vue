<script setup lang="ts">
import {
  EyeOffIcon,
  LayersIcon,
  PlusIcon,
  TrashIcon,
  RefreshCwIcon,
  RssIcon,
  BookHeartIcon,
} from 'lucide-vue-next'
import ActionsBar from './ActionsBar.vue'
import type { Feed } from '@/types/feed'
import { feedStore } from '@/stores/feedStore'

const { feeds, activeFeed, feedFilter } = feedStore()
const emit = defineEmits<{
  select: [feed: Feed]
  unread: []
  favorite: []
  all: []
  add: []
  delete: []
  refresh: []
}>()
</script>

<template>
  <div class="feed-tab">
    <ActionsBar>
      <div class="filter-group">
        <button
          :class="['icon-btn', feedFilter === 'all' ? 'active' : '']"
          @click="emit('all')"
          title="All"
        >
          <LayersIcon />
        </button>
        <button
          :class="['icon-btn', feedFilter === 'unread' ? 'active' : '']"
          @click="emit('unread')"
          title="Unread"
        >
          <EyeOffIcon />
        </button>
        <button
          :class="['icon-btn', feedFilter === 'favorite' ? 'active' : '']"
          @click="emit('favorite')"
          title="Favorite"
        >
          <BookHeartIcon />
        </button>
      </div>

      <button class="icon-btn" @click="emit('add')" title="Add feed">
        <PlusIcon />
      </button>
      <button class="icon-btn" @click="emit('refresh')" title="Refresh">
        <RefreshCwIcon />
      </button>
      <button class="icon-btn danger" @click="emit('delete')" title="Delete">
        <TrashIcon />
      </button>
    </ActionsBar>
    <div class="feed-list">
      <div
        v-for="feed in feeds"
        :key="feed.id"
        :class="['feed-item', activeFeed?.id === feed.id ? 'active' : '']"
        @click="emit('select', feed)"
      >
        <RssIcon :size="14" class="feed-icon" />
        <span class="feed-name">{{ feed.name }}</span>
        <span class="feed-count">{{ feed.count }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.feed-tab {
  display: flex;
  flex-direction: column;
  width: 20%;
  min-width: 200px;
  height: 100%;
  border-right: 1px solid #e5e7eb;
  flex-shrink: 0;
}
.feed-list {
  flex: 1;
  overflow-y: auto;
}
.feed-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #e5e7eb;
  font-size: 13px;
  color: #111827;
  transition: background 0.15s;
}
.feed-item:hover {
  background: #f3f4f6;
}
.feed-item.active {
  background: #f3f4f6;
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
.icon-btn.active {
  color: #ffffff;
  background: #418dff;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 6px;
  padding: 2px;
}
</style>
