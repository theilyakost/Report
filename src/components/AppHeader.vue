<template>
  <header class="app-header">
    <button v-if="isDetailsPage" @click="goBack" class="header-button" aria-label="Назад">
      <span class="material-symbols-outlined">arrow_back</span>
    </button>
    <div v-else class="header-button-placeholder"></div>

    <h1 id="header-title">{{ headerTitle }}</h1>

    <div class="header-button-placeholder"></div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const isDetailsPage = computed(() => route.name === 'PatientDetails');

const headerTitle = computed(() => {
  return route.meta.title || 'SYSTEM';
});

const goBack = () => {
  router.back();
};
</script>