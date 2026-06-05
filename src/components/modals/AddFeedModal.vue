<script setup lang="ts">
import type { DiscoverFeed } from '@/types/feed'
import { onMounted, ref } from 'vue'

defineProps<{
  postFeedError: string | null
  loadingPostFeed: boolean
  loadingDiscoverOptions: boolean
  discoverError: string | null
  showOptions: boolean
  discoveredFeeds: DiscoverFeed[]
}>()

const emit = defineEmits<{
  close: []
  add: [url: string, name: string]
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

      <template v-if="!showOptions">
        <input
          ref="inputRef"
          v-model="url"
          class="modal-input"
          type="url"
          placeholder="https://example.com/feed.xml"
          @keyup.enter="emit('submit', url)"
        />
        <p v-if="postFeedError" class="modal-error">Invalid RSS feed link</p>
        <div class="modal-actions">
          <button class="modal-btn cancel" @click="emit('close')">Cancel</button>
          <button
            class="modal-btn confirm"
            :disabled="loadingPostFeed || loadingDiscoverOptions"
            @click="emit('submit', url)"
          >
            {{ loadingDiscoverOptions ? 'Searching...' : loadingPostFeed ? 'Adding...' : 'Add' }}
          </button>
        </div>
      </template>

      <template v-else>
        <p class="modal-subtitle">Multiple feeds found. Choose one below:</p>
        <ul class="modal-options">
          <li
            v-for="option in discoveredFeeds"
            :key="option.url"
            class="modal-option"
            @click="emit('add', option.url, option.name)"
          >
            {{ option.name }}
          </li>
        </ul>
        <div class="modal-actions">
          <button class="modal-btn cancel" @click="emit('close')">Cancel</button>
        </div>
      </template>
    </div>
  </div>
</template>
<style scoped>
.modal-options {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.modal-option {
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid var(--border-color, #e2e8f0);
  background: var(--bg-secondary, #f8fafc);
  font-size: 0.9rem;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.modal-option:hover {
  background: var(--bg-hover, #e2e8f0);
  border-color: var(--accent, #6366f1);
}

.modal-subtitle {
  font-size: 0.85rem;
  color: var(--text-muted, #64748b);
  margin-bottom: 8px;
}
</style>
