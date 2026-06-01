<script setup lang="ts">
import type { Feed } from '@/types/feed'

defineProps<{
  feed: Feed
  loading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  close: []
  submit: [feedId: number]
}>()
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <h2 class="modal-title">Delete feed</h2>
      <p class="modal-message">
        Are you sure you want to delete <strong>{{ feed.name }}</strong
        >? This will also remove all its items.
      </p>
      <p v-if="error" class="modal-error">{{ error }}</p>
      <div class="modal-actions">
        <button class="modal-btn cancel" @click="emit('close')">Cancel</button>
        <button class="modal-btn danger" :disabled="loading" @click="emit('submit', feed.id)">
          {{ loading ? 'Deleting...' : 'Delete' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
