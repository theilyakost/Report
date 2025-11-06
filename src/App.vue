<template>
  <div class="app-container">
    <AppHeader />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="screen-swap" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <BottomNav />
    <div class="toast-container">
      <div v-for="toast in toasts" :key="toast.id" class="toast" :class="toast.type">
        <span>{{ toast.message }}</span>
        <button v-if="toast.onUndo" @click="handleUndo(toast)" class="toast-undo-button">
          ОТМЕНИТЬ
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from './components/AppHeader.vue';
import BottomNav from './components/BottomNav.vue';
import { useMainStore } from './stores/mainStore';
import { useToasts } from './composables/useToasts';
import { watch } from 'vue';
import type { Toast } from './composables/useToasts';

const store = useMainStore();
const { toasts, hideToast } = useToasts();

watch(() => store.theme, (newTheme) => {
  const root = document.documentElement;
  if (newTheme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.dataset.theme = prefersDark ? 'dark' : 'light';
  } else {
    root.dataset.theme = newTheme;
  }
}, { immediate: true });
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
  if (store.theme === 'system') {
    document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
  }
});
function handleUndo(toast: Toast) {
  if (toast.onUndo) {
    toast.onUndo();
  }
  hideToast(toast.id);
}
</script>

<style>

.screen-swap-enter-active,
.screen-swap-leave-active {
  transition: opacity 0.1s linear;
}
.screen-swap-enter-from,
.screen-swap-leave-to {
  opacity: 0;
}

.toast {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.toast-undo-button {
  background: rgba(0,0,0,0.2);
  border: none;
  color: var(--color-ink-inverted);
  font-weight: bold;
  margin-left: 16px;
  cursor: pointer;
  padding: 6px 10px;
  border-radius: var(--border-radius);
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.5px;
  transition: background-color var(--transition-speed) var(--transition-timing);
}
.toast-undo-button:hover {
  background: rgba(0,0,0,0.4);
}
</style>