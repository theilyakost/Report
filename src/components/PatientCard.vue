<template>
  <div class="patient-card" :class="{ 'is-done-today': isDoneToday }">
    <div class="patient-card-info">
      <h4>{{ patient.surname }} {{ patient.name }}</h4>
      <p>
        <span v-if="patient.time">{{ patient.time }} &bull; </span>
        <span>Палата {{ patient.room || '–' }} &bull; </span>
        <span>{{ patient.department }}</span>
      </p>
    </div>

    <div class="patient-card-progress-text">
      {{ completedCount }} / {{ patient.n }}
    </div>

    <span class="material-symbols-outlined patient-card-chevron">chevron_right</span>

    <div class="patient-progress-bar">
      <div class="patient-progress-bar-inner" :style="{ width: progress + '%' }"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Patient } from '@/types';

const props = defineProps<{
  patient: Patient;
}>();

const completedCount = computed(() => {
  return Object.values(props.patient.dates || {}).filter(val => val === 1).length;
});

const progress = computed(() => {
  if (!props.patient.n || props.patient.n <= 0) return 0;
  return (completedCount.value / props.patient.n) * 100;
});

const isDoneToday = computed(() => {
  const todayStr = new Date().toISOString().slice(0, 10);
  return !!props.patient.dates[todayStr];
});
</script>