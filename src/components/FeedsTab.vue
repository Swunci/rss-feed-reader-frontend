<script setup lang="ts">
import {
  EyeOffIcon,
  LayersIcon,
  PlusIcon,
  TrashIcon,
  RefreshCwIcon,
  SquarePenIcon,
  RssIcon,
  BookHeartIcon,
  EllipsisIcon,
  FolderPlusIcon,
} from 'lucide-vue-next'
import ActionsBar from './ActionsBar.vue'
import type { Feed } from '@/types/feed'
import { feedStore } from '@/stores/feedStore'
import DropdownMenu from './DropdownMenu.vue'
import { ref } from 'vue'
import { collectionStore } from '@/stores/collectionStore'

const { collections, expandedCollections, toggleCollection } = collectionStore()
const { feeds, activeFeed, feedFilter } = feedStore()
const emit = defineEmits<{
  select: [feed: Feed]
  unread: []
  favorite: []
  all: []
  addFeed: []
  addCollection: []
  delete: []
  refresh: []
  rename: []
}>()

const dropdownRef = ref<InstanceType<typeof DropdownMenu> | null>(null)
</script>

<template>
  <div class="feed-tab">
    <ActionsBar>
      <button class="app-icon">
        <PlusIcon />
      </button>

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

      <DropdownMenu align="right" ref="dropdownRef">
        <template #trigger>
          <button class="icon-btn" title="More">
            <EllipsisIcon />
          </button>
        </template>
        <button
          class="dropdown-item"
          @click="
            () => {
              emit('addFeed')
              dropdownRef?.close()
            }
          "
        >
          <span class="dropdown-item-icon"><PlusIcon /></span>
          New Feed
        </button>
        <button
          class="dropdown-item"
          @click="
            () => {
              emit('addCollection')
              dropdownRef?.close()
            }
          "
        >
          <span class="dropdown-item-icon"><FolderPlusIcon /></span>
          New Collection
        </button>
        <button
          class="dropdown-item"
          @click="
            () => {
              emit('refresh')
              dropdownRef?.close()
            }
          "
        >
          <span class="dropdown-item-icon"><RefreshCwIcon /></span>
          Refresh Feeds
        </button>
        <button
          class="dropdown-item"
          @click="
            () => {
              emit('rename')
              dropdownRef?.close()
            }
          "
        >
          <span class="dropdown-item-icon"><SquarePenIcon /></span>
          Rename Feed
        </button>
        <button
          class="dropdown-item danger"
          @click="
            () => {
              emit('delete')
              dropdownRef?.close()
            }
          "
        >
          <span class="dropdown-item-icon">
            <TrashIcon />
          </span>
          Delete Feed
        </button>
      </DropdownMenu>
    </ActionsBar>
    <div class="collection-list">
      <div v-for="collection in collections" :key="collection.id" class="collection-group">
        <div class="collection-item" @click="toggleCollection(collection.id)">
          <ChevronRightIcon
            :size="14"
            :class="[
              'collection-chevron',
              expandedCollections.has(collection.id) ? 'expanded' : '',
            ]"
          />
          <LayersIcon :size="14" class="collection-icon" />
          <span class="collection-name">{{ collection.name }}</span>
        </div>
        <div v-if="expandedCollections.has(collection.id)" class="collection-feeds">
          <div
            v-for="feed in feeds?.filter((f) => f.collectionId === collection.id)"
            :key="feed.id"
            :class="['feed-item', 'indented', activeFeed?.id === feed.id ? 'active' : '']"
            @click="emit('select', feed)"
          >
            <RssIcon :size="14" class="feed-icon" />
            <span class="feed-name">{{ feed.name }}</span>
            <span class="feed-count">{{ feed.count }}</span>
          </div>
        </div>
      </div>
    </div>
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

.app-icon {
  border-radius: 6px;
  padding: 2px;
  visibility: hidden;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  border-radius: 6px;
  padding: 2px;
}

.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  white-space: nowrap;
  padding: 0.5rem 0.5rem;
  border: none;
  background: transparent;
  color: #6b7280;
  border-radius: 6px;
  cursor: pointer;
  transition:
    background 0.15s,
    color 0.15s;
}

.dropdown-item:hover {
  background: #5e9eff;
  color: #dde2eb;
}

.dropdown-item.danger:hover {
  color: #ef4444;
}

.dropdown-item-icon {
  margin-right: 0.5rem;
  display: flex;
  align-items: center;
}

.collection-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  cursor: pointer;
  font-size: 13px;
  color: #111827;
  transition: background 0.15s;
  border-bottom: 1px solid #e5e7eb;
}

.collection-item:hover {
  background: #f3f4f6;
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

.feed-item.indented {
  padding-left: 32px;
}
</style>
