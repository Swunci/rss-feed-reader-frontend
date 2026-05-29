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
import { itemStore } from '@/stores/itemStore'
import { feedStore } from '@/stores/feedStore'

const { activeItem } = itemStore()
const { feeds } = feedStore()

const safeHtml = computed(() => {
  if (activeItem.value) {
    return fixLinks(activeItem.value.description)
  }
  return ''
})

const feedName = computed(() => {
  return feeds.value?.find((f) => f.id == activeItem.value?.feedId)?.name
})

const emit = defineEmits<{
  favorite: [id: number]
  markRead: []
  openLink: []
}>()
</script>

<template>
  <div class="item-content-tab">
    <ActionsBar>
      <div class="actions-group">
        <button class="icon-btn" @click="emit('favorite', activeItem!.id)" title="Favorite">
          <HeartPlusIcon v-if="!activeItem!.isFavorite" />
          <HeartMinusIcon v-else />
        </button>
        <button
          class="icon-btn"
          @click="emit('markRead')"
          :title="activeItem!.isRead ? 'Mark as unread' : 'Mark as read'"
        >
          <CircleCheckIcon v-if="!activeItem!.isRead" />
          <CircleMinusIcon v-else />
        </button>
        <button class="icon-btn" @click="emit('openLink')" title="Open link">
          <ExternalLinkIcon />
        </button>
      </div>
    </ActionsBar>
    <div class="scroll-container">
      <div class="content-wrapper">
        <h1>
          <b>{{ activeItem!.title }}</b>
        </h1>
        <div>{{ feedName }}</div>
        <div>{{ formatDate(activeItem!.publishedAt) }}</div>
        <hr />
        <div v-html="safeHtml"></div>
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
</style>
