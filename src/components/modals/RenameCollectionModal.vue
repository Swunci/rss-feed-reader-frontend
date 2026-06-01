<script setup lang="ts">
import type { Collection } from '@/types/collection'
import { onMounted, ref } from 'vue'

defineProps<{
  collection: Collection
  error: string | null
  loading: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [collectionId: number, name: string]
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
      <h2 class="modal-title">Rename collection</h2>
      <input
        ref="inputRef"
        v-model="name"
        class="modal-input"
        type="text"
        :placeholder="collection.name"
        @keyup.enter="emit('submit', collection.id, name)"
      />
      <p v-if="error" class="modal-error">Failed to rename</p>
      <div class="modal-actions">
        <button class="modal-btn cancel" @click="emit('close')">Cancel</button>
        <button
          class="modal-btn confirm"
          :disabled="loading"
          @click="emit('submit', collection.id, name)"
        >
          {{ loading ? 'Renaming...' : 'Rename' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
