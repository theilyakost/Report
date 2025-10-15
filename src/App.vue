<template>
  <div class="app-container">
    <AppHeader />
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <BottomNav />
    <div id="toast-container" class="toast-container"></div>
  </div>
</template>

<script setup lang="ts">
import AppHeader from './components/AppHeader.vue';
import BottomNav from './components/BottomNav.vue';
import { useMainStore } from './stores/mainStore';
import { watch } from 'vue';

const store = useMainStore();

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
</script>

<style>

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>