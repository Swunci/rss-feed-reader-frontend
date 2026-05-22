<script setup lang="ts">
import { CheckCheckIcon } from 'lucide-vue-next'
import ActionsBar from './ActionsBar.vue'
import type { Item } from '@/types/item'
import { formatRelativeTime } from '@/utils/date'
import { LoaderCircleIcon } from 'lucide-vue-next'

defineProps<{
  items: Item[]
  activeItem: Item | null
  loading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  select: [item: Item]
  markAllRead: []
  loadMore: []
}>()
</script>

<template>
  <div class="items-tab">
    <ActionsBar>
      <button class="icon-btn" @click="emit('markAllRead')" title="Mark all read">
        <CheckCheckIcon :size="25" />
      </button>
    </ActionsBar>
    <div class="items-list">
      <div
        v-for="item in items"
        :key="item.id"
        :class="['news-item', activeItem?.id === item.id ? 'active' : '']"
        @click="emit('select', item)"
      >
        <div class="news-item-inner">
          <span v-if="item.isFavorite" class="favorite-star" />
          <span v-else-if="!item.isRead" class="unread-dot" />
          <p :class="['news-title', !item.isRead ? 'unread' : 'read']">{{ item.title }}</p>
        </div>
        <p class="news-date">{{ formatRelativeTime(item.publishedAt) }}</p>
      </div>
      <div ref="bottomSentinel" class="sentinel">
        <div v-if="loading" class="scroll-status">
          <LoaderCircleIcon :size="30" class="spinner" />
        </div>
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
</style>
