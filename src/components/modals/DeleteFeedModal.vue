<script setup lang="ts">
import type { Feed } from '@/types/feed'

defineProps<{
  feed: Feed
  loading: boolean
  error: string | null
}>()

const emit = defineEmits<{
  close: []
  confirm: []
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
        <button class="modal-btn danger" :disabled="loading" @click="emit('confirm')">
          {{ loading ? 'Deleting...' : 'Delete' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
}
.modal {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  width: 400px;
  border: 1px solid #e5e7eb;
}
.modal-title {
  font-size: 16px;
  font-weight: 500;
  color: #111827;
  margin-bottom: 12px;
}
.modal-message {
  font-size: 14px;
  color: #6b7280;
  line-height: 1.5;
  margin-bottom: 16px;
}
.modal-error {
  font-size: 13px;
  color: #ef4444;
  margin-bottom: 12px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
.modal-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  border: 1px solid #e5e7eb;
  transition: background 0.15s;
}
.modal-btn.cancel {
  background: transparent;
  color: #6b7280;
}
.modal-btn.cancel:hover {
  background: #f3f4f6;
}
.modal-btn.danger {
  background: #ef4444;
  color: #fff;
  border-color: #ef4444;
}
.modal-btn.danger:hover {
  background: #dc2626;
}
.modal-btn.danger:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
