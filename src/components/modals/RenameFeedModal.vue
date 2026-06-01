<script setup lang="ts">
import type { Feed } from '@/types/feed'
import { onMounted, ref } from 'vue'

defineProps<{
  feed: Feed
  error: string | null
  loading: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [feedId: number, name: string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const name = ref('')

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <h2 class="modal-title">Rename feed</h2>
      <input
        ref="inputRef"
        v-model="name"
        class="modal-input"
        type="text"
        :placeholder="feed.name"
        @keyup.enter="emit('submit', feed.id, name)"
      />
      <p v-if="error" class="modal-error">Failed to rename</p>
      <div class="modal-actions">
        <button class="modal-btn cancel" @click="emit('close')">Cancel</button>
        <button
          class="modal-btn confirm"
          :disabled="loading"
          @click="emit('submit', feed.id, name)"
        >
          {{ loading ? 'Renaming...' : 'Rename' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
