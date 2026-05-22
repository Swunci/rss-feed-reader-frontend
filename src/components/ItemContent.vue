<script setup lang="ts">
import type { Item } from '@/types/item'
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

const props = defineProps<{
  item: Item
  feedName: string
}>()

const safeHtml = computed(() => fixLinks(props.item.description))

const emit = defineEmits<{
  favorite: [id: number]
  markRead: []
  openLink: []
}>()
</script>

<template>
  <div class="item-tab">
    <ActionsBar>
      <button class="icon-btn" @click="emit('favorite', item.id)" title="Favorite">
        <HeartPlusIcon v-if="!item.isFavorite" />
        <HeartMinusIcon v-else />
      </button>
      <button
        class="icon-btn"
        @click="emit('markRead')"
        :title="item.isRead ? 'Mark as unread' : 'Mark as read'"
      >
        <CircleCheckIcon v-if="!item.isRead" />
        <CircleMinusIcon v-else />
      </button>
      <button class="icon-btn" @click="emit('openLink')" title="Open link">
        <ExternalLinkIcon />
      </button>
    </ActionsBar>
    <div class="content-wrapper">
      <h1>
        <b>{{ item.title }}</b>
      </h1>
      <div>{{ feedName }}</div>
      <div>{{ formatDate(item.publishedAt) }}</div>
      <div v-html="safeHtml"></div>
    </div>
  </div>
</template>

<style scoped>
.item-tab {
  display: flex;
  flex-direction: column;
  min-width: 200px;
  height: 100%;
  border-right: 1px solid #e5e7eb;
  flex-shrink: 1;
  flex-grow: 1;
}

.content-wrapper {
  flex: 1;
  overflow-y: auto;
}
</style>
