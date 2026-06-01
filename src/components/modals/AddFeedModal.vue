<script setup lang="ts">
import { onMounted, ref } from 'vue'

defineProps<{
  error: string | null
  loading: boolean
}>()

const emit = defineEmits<{
  close: []
  submit: [url: string]
}>()

const inputRef = ref<HTMLInputElement | null>(null)

const url = ref('')

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <h2 class="modal-title">Add RSS feed</h2>
      <input
        ref="inputRef"
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
          {{ loading ? 'Adding...' : 'Add' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
