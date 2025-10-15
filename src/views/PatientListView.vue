<template>
  <div>
    <div class="filter-tabs">
      <button class="filter-tab" :class="{ active: filter === 'today' }" @click="filter = 'today'">На сегодня</button>
      <button class="filter-tab" :class="{ active: filter === 'all' }" @click="filter = 'all'">Все</button>
    </div>

    <div class="patient-list" v-if="patientsToShow.length > 0">
      <PatientCard
          v-for="patient in patientsToShow"
          :key="patient.id"
          :patient="patient"
          @click="goToDetails(patient.id)"
      />
    </div>
    <div v-else class="empty-list-message">
      <p v-if="filter === 'today'">На сегодня процедур больше нет. Отличная работа!</p>
      <p v-else>Список пациентов пуст. Добавьте первого, нажав на "+".</p>
    </div>

    <button @click="addNewPatient" class="fab" aria-label="Добавить пациента">
      <span class="material-symbols-outlined">add</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMainStore } from '@/stores/mainStore';
import PatientCard from '@/components/PatientCard.vue';

const router = useRouter();
const store = useMainStore();
const filter = ref('today');

const patientsToShow = computed(() => {
  const list = filter.value === 'today' ? store.patientsForToday : store.allPatientsSorted;
  return list || [];
});

function goToDetails(id: string){
  router.push(`/patient/${id}`);
}

function addNewPatient() {
  const newPatient = store.addPatient();
  router.push(`/patient/${newPatient.id}`);
}
</script>