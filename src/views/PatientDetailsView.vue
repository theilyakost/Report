<template>
  <div>
    <div v-if="localPatient" class="details-content">
      <div class="card">
        <div class="input-group">
          <label for="patient-surname">Фамилия</label>
          <input type="text" id="patient-surname" placeholder="Обязательное поле" v-model.trim="localPatient.surname" @input="debouncedSave">
        </div>
        <div class="input-group">
          <label for="patient-name">Имя</label>
          <input type="text" id="patient-name" v-model.trim="localPatient.name" @input="debouncedSave">
        </div>
        <div style="display: flex; gap: 16px;">
          <div class="input-group" style="flex: 1;">
            <label for="patient-time">Время</label>
            <input type="time" id="patient-time" v-model="localPatient.time" @change="debouncedSave">
          </div>
          <div class="input-group" style="flex: 1;">
            <label for="patient-room">Палата</label>
            <input type="text" id="patient-room" placeholder="№" v-model="localPatient.room" @input="debouncedSave">
          </div>
        </div>
        <div class="input-group">
          <label for="patient-department">Отделение</label>
          <select id="patient-department" v-model="localPatient.department" @change="debouncedSave">
            <option v-for="dep in DEPARTMENTS" :key="dep" :value="dep">{{ dep }}</option>
          </select>
        </div>
        <div class="input-group" style="margin-bottom: 0;">
          <label for="patient-n">Кол-во процедур (N)</label>
          <input type="number" id="patient-n" placeholder="10" v-model.number="localPatient.n" @input="debouncedSave">
        </div>
      </div>
      <div class="card">
        <div class="assignments-list" style="margin-bottom: 16px;">
          <span v-if="localPatient.assignments.length === 0" class="text-secondary">НЕТ НАЗНАЧЕНИЙ</span>
          <span v-for="assignment in localPatient.assignments" :key="assignment" class="assignment-tag">
              {{ assignment }}
          </span>
        </div>
        <button @click="isAssignmentModalOpen = true" class="button-secondary">
          <span class="material-symbols-outlined">edit</span> Изменить
        </button>
      </div>
      <div class="card">
        <ProcedureCalendar :patient="localPatient" @day-click="handleDayClick" />
      </div>
      <div v-if="isExistingPatient" class="card danger-zone">
        <button @click="confirmDelete" class="button-danger">
          <span class="material-symbols-outlined">delete</span> Удалить запись пациента
        </button>
      </div>
    </div>

    <div v-else class="empty-list-message">
      <p>ЗАГРУЗКА ДАННЫХ...</p>
    </div>

    <AssignmentModal
        :is-open="isAssignmentModalOpen"
        :all-assignments="AVAILABLE_ASSIGNMENTS"
        :patient-assignments="localPatient?.assignments || []"
        @close="isAssignmentModalOpen = false"
        @save="updateAssignments"
    />

    <div id="calendar-day-modal" class="modal-overlay" :class="{ active: isDayModalOpen }" @click.self="isDayModalOpen = false">
      <div class="modal-content">
        <h3 id="calendar-day-title" class="modal-title">СТАТУС: {{ selectedDate }}</h3>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <button @click="markDay(1)" class="button-primary"><span class="material-symbols-outlined">check_circle</span> ВЫПОЛНЕНО</button>
          <button @click="markDay(2)" class="button-danger"><span class="material-symbols-outlined">cancel</span> ПРОПУЩЕНО</button>
          <button @click="markDay(null)" class="button-secondary">ОЧИСТИТЬ</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {ref, onMounted, onUnmounted, computed} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMainStore } from '@/stores/mainStore';
import { useHaptics } from '@/composables/useHaptics';
import type { Patient, ProcedureStatus } from '@/types';
import ProcedureCalendar from '@/components/ProcedureCalendar.vue';
import AssignmentModal from '@/components/AssignmentModal.vue';
import { AVAILABLE_ASSIGNMENTS, DEPARTMENTS } from '@/utils/constants';
const { triggerSelection, triggerConfirm, triggerError } = useHaptics();

const SAVE_DEBOUNCE_DELAY = 500;

const route = useRoute();
const router = useRouter();
const store = useMainStore();

const localPatient = ref<Patient | null>(null);
const isAssignmentModalOpen = ref(false);
const isDayModalOpen = ref(false);
const selectedDate = ref<string | null>(null);

onMounted(() => {
  const patientId = route.params.id as string;
  const patientData = store.getPatientById(patientId);
  if (patientData) {
    localPatient.value = JSON.parse(JSON.stringify(patientData));
  } else {
    router.push('/');
  }
});

onUnmounted(() => {
  debouncedSave.flush();
});

const isExistingPatient = computed(() => {
  return localPatient.value && localPatient.value.surname && localPatient.value.surname.trim() !== '';
});

function updateAssignments(newAssignments: string[]) {
  if (localPatient.value) {
    localPatient.value.assignments = newAssignments;
    debouncedSave();
  }
}

function handleDayClick(date: string) {
  triggerSelection();
  selectedDate.value = date;
  isDayModalOpen.value = true;
}

function markDay(status: ProcedureStatus | null) {
  triggerConfirm();
  if (localPatient.value && selectedDate.value) {
    if (status === null) {
      delete localPatient.value.dates[selectedDate.value];
    } else {
      localPatient.value.dates[selectedDate.value] = status;
    }
    debouncedSave();
    isDayModalOpen.value = false;
  }
}

function confirmDelete() {
  triggerError();
  if (localPatient.value) {
    const confirmation = window.confirm(
        `ВНИМАНИЕ: ЗАПИСЬ ПАЦИЕНТА "${localPatient.value.surname}" БУДЕТ УДАЛЕНА. ЭТО ДЕЙСТВИЕ НЕОБРАТИМО. ПОДТВЕРДИТЬ?`
    );
    if (confirmation) {
      debouncedSave.cancel();
      store.deletePatient(localPatient.value.id);
      router.push('/');
    }
  }
}

const debouncedSave = (() => {
  let debounceTimer: number;

  const mainFn = () => {
    if (!localPatient.value) return;
    if (localPatient.value.surname.trim() === '') return;

    clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => {
      if (localPatient.value) {
        store.updatePatient(JSON.parse(JSON.stringify(localPatient.value)));
      }
    }, SAVE_DEBOUNCE_DELAY);
  };

  mainFn.flush = () => {
    clearTimeout(debounceTimer);
    if (localPatient.value && localPatient.value.surname.trim() !== '') {
      store.updatePatient(JSON.parse(JSON.stringify(localPatient.value)));
    }
  };

  mainFn.cancel = () => {
    clearTimeout(debounceTimer);
  };

  return mainFn;
})();
</script>