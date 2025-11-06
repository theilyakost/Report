<template>
  <div>
    <div class="filter-tabs">
      <button
          class="filter-tab"
          :class="{ active: filter === 'today' }"
          @click="setFilter('today')">
        НА СЕГОДНЯ
      </button>
      <button
          class="filter-tab"
          :class="{ active: filter === 'all' }"
          @click="setFilter('all')">
        ВСЕ
      </button>
    </div>

    <div class="patient-list" v-if="patientsToShow.length > 0">
      <PatientCard
          v-for="patient in patientsToShow"
          :key="patient.id"
          :patient="patient"
          @navigate="goToDetails(patient.id)"
          @mark-done="markProcedure(patient.id, 1)"
          @mark-missed="markProcedure(patient.id, 2)"
      />
    </div>

    <div v-else class="empty-list-message">
      <p v-if="filter === 'today'">ЗАДАЧИ НА СЕГОДНЯ ОТСУТСТВУЮТ. СИСТЕМА В РЕЖИМЕ ОЖИДАНИЯ.</p>
      <p v-else>СПИСОК ПАЦИЕНТОВ ПУСТ. ДЛЯ ДОБАВЛЕНИЯ НОВОЙ ЗАПИСИ ИСПОЛЬЗУЙТЕ [+].</p>
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
import { useToasts } from '@/composables/useToasts';
import { useHaptics } from '@/composables/useHaptics';
const { triggerConfirm, triggerSelection } = useHaptics();
import PatientCard from '@/components/PatientCard.vue';
import type { ProcedureStatus } from '@/types';

const router = useRouter();
const store = useMainStore();
const { showToast } = useToasts();
const filter = ref<'today' | 'all'>('today');

const patientsToShow = computed(() => {
  return filter.value === 'today' ? store.patientsForToday : store.allPatientsSorted;
});

function setFilter(newFilter: 'today' | 'all') {
  triggerSelection();
  filter.value = newFilter;
}

function goToDetails(id: string) {
  router.push(`/patient/${id}`);
}

function addNewPatient() {
  triggerConfirm();
  const newPatient = store.addPatient();
  router.push(`/patient/${newPatient.id}`);
}

function markProcedure(patientId: string, status: ProcedureStatus) {
  triggerConfirm();
  store.updateProcedureStatus(patientId, status);

  const patient = store.getPatientById(patientId);
  if (!patient) return;

  const statusText = status === 1 ? 'выполнена' : 'пропущена';

  // Уведомление с возможностью отмены
  showToast(
      `Процедура для ${patient.surname} отмечена как ${statusText}.`,
      'info',
      5000,
      () => {
        store.clearProcedureStatus(patientId);
      }
  );
}
</script>