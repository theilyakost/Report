<template>
  <div class="patient-card" :class="{ 'is-done-today': isDoneToday }">

    <div class="patient-card-main-area" @click="emit('navigate')">
      <div class="patient-card-info">
        <div class="patient-card-primary-line">
          <h4 class="patient-name">{{ patient.surname }} {{ patient.name }}</h4>
          <span v-if="patient.time" class="patient-time">{{ patient.time }}</span>
        </div>
        <p class="patient-card-secondary-line">
          <span>Палата {{ patient.room || '–' }} &bull; </span>
          <span>{{ patient.department }}</span>
        </p>
      </div>

      <div class="patient-card-progress-text">
        {{ completedCount }} / {{ patient.n }}
      </div>
    </div>

    <div class="patient-card-controls">
      <div class="patient-card-progress-bar">
        <div class="patient-progress-bar-inner" :style="{ width: progress + '%' }"></div>
      </div>
      <div class="patient-card-action-row">
        <button class="patient-card-action-btn miss" @click.stop="emit('mark-missed', patient.id)" aria-label="Пропущено">
          <span class="material-symbols-outlined">cancel</span>
        </button>
        <button class="patient-card-action-btn done" @click.stop="emit('mark-done', patient.id)" aria-label="Выполнено">
          <span class="material-symbols-outlined">check_circle</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Patient } from '@/types';
const props = defineProps<{ patient: Patient; }>();
const emit = defineEmits<{(e: 'navigate'): void; (e: 'mark-done', id: string): void; (e: 'mark-missed', id: string): void;}>();
const completedCount = computed(() => { if (!props.patient.dates) return 0; return Object.values(props.patient.dates).filter(val => val === 1).length; });
const progress = computed(() => { if (!props.patient.n || props.patient.n <= 0) return 0; return (completedCount.value / props.patient.n) * 100; });
const isDoneToday = computed(() => { const todayStr = new Date().toISOString().slice(0, 10); return props.patient.dates && props.patient.dates[todayStr] !== undefined; });
</script>