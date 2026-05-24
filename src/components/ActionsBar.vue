<script setup lang="ts"></script>

<template>
  <div class="actions-bar">
    <slot />
  </div>
</template>

<style scoped>
.actions-bar {
  display: flex;
  align-items: center;
  padding-inline: 0.25rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
  height: 2rem;
  justify-content: space-between;
}
</style>
