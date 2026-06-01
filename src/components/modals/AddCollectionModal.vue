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

const name = ref('')

onMounted(() => {
  inputRef.value?.focus()
})
</script>

<template>
  <div class="modal-overlay" @click.self="emit('close')">
    <div class="modal">
      <h2 class="modal-title">Add collection</h2>
      <input
        ref="inputRef"
        v-model="name"
        class="modal-input"
        type="text"
        placeholder="Name"
        @keyup.enter="emit('submit', name)"
      />
      <p v-if="error" class="modal-error">Failed to add collection</p>
      <div class="modal-actions">
        <button class="modal-btn cancel" @click="emit('close')">Cancel</button>
        <button class="modal-btn confirm" :disabled="loading" @click="emit('submit', name)">
          {{ loading ? 'Adding...' : 'Add' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
