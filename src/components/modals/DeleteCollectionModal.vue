<script setup lang="ts">
import type { Collection } from '@/types/collection'

defineProps<{
  collection: Collection
  loading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  close: []
  confirm: [collectionId: number]
}>()
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <h2 class="modal-title">Delete collection</h2>
      <p class="modal-message">
        Are you sure you want to delete <strong>{{ collection.name }}</strong
        >?
      </p>
      <p v-if="error" class="modal-error">{{ error }}</p>
      <div class="modal-actions">
        <button class="modal-btn cancel" @click="emit('close')">Cancel</button>
        <button
          class="modal-btn danger"
          :disabled="loading"
          @click="emit('confirm', collection.id)"
        >
          {{ loading ? 'Deleting...' : 'Delete' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
