<script setup lang="ts">
import {
  EyeOffIcon,
  LayersIcon,
  PlusIcon,
  RefreshCwIcon,
  BookHeartIcon,
  EllipsisIcon,
  FolderPlusIcon,
} from 'lucide-vue-next'
import ActionsBar from '@/components/ActionsBar.vue'
import FeedsList from './FeedsList.vue'
import { useFeedStore } from '@/stores/feedStore'
import DropdownMenu from '@/components/DropdownMenu.vue'
import { ref } from 'vue'

const feedStore = useFeedStore()
const { feedFilter } = feedStore

const emit = defineEmits<{
  addFeed: []
  addCollection: []
  refresh: []
}>()

const handleViewAll = async () => {
  feedFilter.value = 'all'
  await feedStore.fetchFilteredFeeds()
}
const handleViewUnread = async () => {
  feedFilter.value = 'unread'
  await feedStore.fetchFilteredFeeds()
}
const handleViewFavorites = async () => {
  feedFilter.value = 'favorite'
  await feedStore.fetchFilteredFeeds()
}

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
          @click="handleViewAll"
          title="All"
        >
          <LayersIcon />
        </button>
        <button
          :class="['icon-btn', feedFilter === 'unread' ? 'active' : '']"
          @click="handleViewUnread"
          title="Unread"
        >
          <EyeOffIcon />
        </button>
        <button
          :class="['icon-btn', feedFilter === 'favorite' ? 'active' : '']"
          @click="handleViewFavorites"
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
      </DropdownMenu>
    </ActionsBar>
    <FeedsList />
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
</style>
