<script setup lang="ts">
import { RssIcon, SquarePenIcon, TrashIcon } from 'lucide-vue-next'
import type { Feed } from '@/types/feed'

defineProps<{
  feed: Feed
  active: boolean
  indented?: boolean
}>()

const emit = defineEmits<{
  select: [feed: Feed]
  rename: [feed: Feed]
  delete: [feed: Feed]
}>()
</script>

<template>
  <div
    :data-id="feed.id"
    :class="['feed-item', indented ? 'indented' : '', active ? 'active' : '']"
    @click="emit('select', feed)"
  >
    <RssIcon :size="14" class="feed-icon" />
    <span class="feed-name">{{ feed.name }}</span>
    <span class="feed-count">{{ feed.count }}</span>
    <div class="actions" @click.stop>
      <span class="rename-btn" @click.stop="emit('rename', feed)">
        <SquarePenIcon :size="14" />
      </span>
      <span class="delete-btn" @click.stop="emit('delete', feed)">
        <TrashIcon :size="14" />
      </span>
    </div>
  </div>
</template>

<style lang="css" scoped>
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
.feed-item .actions {
  display: none;
}
.feed-item:hover .actions {
  display: flex;
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
.feed-count {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 100%;
  align-content: center;
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
