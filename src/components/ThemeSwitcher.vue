<template>
  <div class="theme-switcher card">
    <h4><span class="material-symbols-outlined">palette</span> Тема оформления</h4>
    <div class="theme-buttons-container">
      <button v-for="theme in themes" :key="theme.value"
              class="theme-btn"
              :class="{ active: currentTheme === theme.value }"
              @click="onThemeSelect(theme.value)">
        <span class="material-symbols-outlined">{{ theme.icon }}</span>
        <span>{{ theme.label }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { AppTheme } from '@/types';

defineProps<{
  currentTheme: AppTheme;
}>();

const emit = defineEmits<{
  (e: 'select-theme', theme: AppTheme): void;
}>();

const themes: { value: AppTheme; label: string; icon: string }[] = [
  { value: 'light', label: 'Светлая', icon: 'light_mode' },
  { value: 'dark', label: 'Тёмная', icon: 'dark_mode' },
  { value: 'comfort', label: 'Комфорт', icon: 'visibility' },
  { value: 'system', label: 'Система', icon: 'devices' },
];

function onThemeSelect(theme: AppTheme) {
  emit('select-theme', theme);
}
</script>

<style scoped>
</style>