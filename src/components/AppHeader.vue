<template>
  <header class="app-header">
    <button v-if="isDetailsPage" @click="goBack" class="header-button">
      <span class="material-symbols-outlined">arrow_back</span>
    </button>
    <div v-else class="header-button-placeholder"></div>

    <h1 id="header-title">{{ headerTitle }}</h1>

    <div class="header-button-placeholder"></div>
  </header>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMainStore } from '@/stores/mainStore';

const route = useRoute();
const router = useRouter();
const store = useMainStore();

const isDetailsPage = computed(() => route.name === 'PatientDetails');

const headerTitle = computed(() => {
  if (route.name === 'PatientDetails') {
    const patient = store.getPatientById(route.params.id);
    return patient?.surname || 'Новый пациент';
  }
  return route.meta.title || 'Отчёт';
});

const goBack = () => {
  router.push('/');
};
</script>