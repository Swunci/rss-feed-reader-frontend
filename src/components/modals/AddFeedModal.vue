<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  error: string | null
  loading: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [url: string]
}>()

const url = ref('')
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <h2 class="modal-title">Add RSS feed</h2>
      <input
        v-model="url"
        class="modal-input"
        type="url"
        placeholder="https://example.com/feed.xml"
        @keyup.enter="emit('submit', url)"
      />
      <p v-if="error" class="modal-error">Invalid RSS feed link</p>
      <div class="modal-actions">
        <button class="modal-btn cancel" @click="emit('close')">Cancel</button>
        <button class="modal-btn confirm" :disabled="loading" @click="emit('submit', url)">
          {{ loading ? 'Adding...' : 'Add feed' }}
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
  width: 420px;
  border: 1px solid #e5e7eb;
}

.modal-error {
  font-size: 13px;
  color: #ef4444;
  margin-bottom: 12px;
}

.modal-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 16px;
  color: #111827;
}
.modal-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #111827;
  outline: none;
  margin-bottom: 16px;
}
.modal-input:focus {
  border-color: #6b7280;
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
.modal-btn.confirm {
  background: #111827;
  color: #fff;
  border-color: #111827;
}
.modal-btn.confirm:hover {
  background: #374151;
}

.modal-btn.confirm:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
