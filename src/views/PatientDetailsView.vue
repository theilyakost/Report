<template>
  <div> <!-- <--- ШАГ 3: Единственный корневой элемент -->

    <!-- Основной контент страницы, который будет анимироваться -->
    <div v-if="localPatient" class="details-content">
      <!-- Карточка с основной информацией -->
      <div class="card patient-info-card">
        <div class="input-group">
          <label for="patient-surname">Фамилия</label>
          <input type="text" id="patient-surname" placeholder="Обязательное поле" v-model.trim="localPatient.surname" @input="debouncedSave">
        </div>
        <div class="input-group">
          <label for="patient-name">Имя</label>
          <input type="text" id="patient-name" v-model.trim="localPatient.name" @input="debouncedSave">
        </div>
        <div class="details-row">
          <div class="input-group">
            <label for="patient-time">Время</label>
            <input type="time" id="patient-time" v-model="localPatient.time" @change="debouncedSave">
          </div>
          <div class="input-group">
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
        <div class="input-group">
          <label for="patient-n">Кол-во процедур (N)</label>
          <input type="number" id="patient-n" placeholder="10" v-model.number="localPatient.n" @input="debouncedSave">
        </div>
      </div>

      <!-- Карточка с назначениями -->
      <div class="card">
        <h3>Назначения</h3>
        <div class="assignments-list">
          <span v-if="localPatient.assignments.length === 0" class="text-secondary">Нет назначений</span>
          <span v-for="assignment in localPatient.assignments" :key="assignment" class="assignment-tag">
              {{ assignment }}
          </span>
        </div>
        <button @click="isAssignmentModalOpen = true" class="button-secondary">
          <span class="material-symbols-outlined">edit</span> Изменить назначения
        </button>
      </div>

      <!-- Карточка с календарем -->
      <div class="card">
        <h3>Календарь процедур</h3>
        <ProcedureCalendar :patient="localPatient" @day-click="handleDayClick" />
      </div>

      <!-- Зона опасности -->
      <div class="card danger-zone">
        <button @click="confirmDelete" class="button-danger">
          <span class="material-symbols-outlined">delete</span> Удалить пациента
        </button>
      </div>
    </div>

    <!-- Состояние загрузки -->
    <div v-else class="empty-list-message">
      <p>Загрузка данных пациента...</p>
    </div>

    <!-- Модальные окна (остаются внутри корневого div) -->
    <AssignmentModal
        :is-open="isAssignmentModalOpen"
        :all-assignments="AVAILABLE_ASSIGNMENTS"
        :patient-assignments="localPatient?.assignments || []"
        @close="isAssignmentModalOpen = false"
        @save="updateAssignments"
    />

    <div id="calendar-day-modal" class="modal-overlay" :class="{ active: isDayModalOpen }" @click.self="isDayModalOpen = false">
      <div class="modal-content">
        <h3 id="calendar-day-title" class="modal-title">Отметить день: {{ selectedDate }}</h3>
        <div class="modal-actions-vertical">
          <button @click="markDay(1)" class="button-primary"><span class="material-symbols-outlined">check_circle</span> Выполнено</button>
          <button @click="markDay(2)" class="button-danger"><span class="material-symbols-outlined">cancel</span> Пропущено</button>
          <button @click="markDay(null)" class="button-secondary">Очистить отметку</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useMainStore } from '@/stores/mainStore';
import type { Patient, ProcedureStatus } from '@/types';
import ProcedureCalendar from '@/components/ProcedureCalendar.vue';
import AssignmentModal from '@/components/AssignmentModal.vue';

// --- Константы ---
import { AVAILABLE_ASSIGNMENTS, DEPARTMENTS } from '@/utils/constants';
const SAVE_DEBOUNCE_DELAY = 700;

// --- Инициализация ---
const route = useRoute();
const router = useRouter();
const store = useMainStore();

// --- Локальное состояние компонента ---
const localPatient = ref<Patient | null>(null);
const isAssignmentModalOpen = ref(false);
const isDayModalOpen = ref(false);
const selectedDate = ref<string | null>(null);

// --- Хуки жизненного цикла ---
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


// --- Функции-обработчики ---

function updateAssignments(newAssignments: string[]) {
  if (localPatient.value) {
    localPatient.value.assignments = newAssignments;
    debouncedSave(); // Вызываем как функцию
  }
}

function handleDayClick(date: string) {
  selectedDate.value = date;
  isDayModalOpen.value = true;
}

function markDay(status: ProcedureStatus | null) {
  if (localPatient.value && selectedDate.value) {
    if (status === null) {
      delete localPatient.value.dates[selectedDate.value];
    } else {
      localPatient.value.dates[selectedDate.value] = status;
    }
    debouncedSave(); // Вызываем как функцию
    isDayModalOpen.value = false;
  }
}

function confirmDelete() {
  if (localPatient.value && window.confirm(`Вы уверены, что хотите удалить пациента ${localPatient.value.surname}? Это действие необратимо.`)) {
    debouncedSave.cancel();
    store.deletePatient(localPatient.value.id);
    router.push('/');
  }
}

// --- Логика автосохранения (ИСПРАВЛЕННАЯ) ---
let debounceTimer: number;

// ШАГ 1 и 2: Превращаем debouncedSave в настоящую функцию
const debouncedSave = (() => {
  const mainFn = () => {
    if (!localPatient.value) return;

    if (localPatient.value.surname.trim() === '') {
      console.warn("Попытка сохранить пациента без фамилии. Сохранение отменено.");
      return;
    }

    clearTimeout(debounceTimer);
    debounceTimer = window.setTimeout(() => {
      if (localPatient.value) {
        store.updatePatient(localPatient.value);
        console.log("Данные пациента сохранены");
      }
    }, SAVE_DEBOUNCE_DELAY);
  };

  mainFn.flush = () => {
    clearTimeout(debounceTimer);
    if (localPatient.value && localPatient.value.surname.trim() !== '') {
      store.updatePatient(localPatient.value);
    }
  };

  mainFn.cancel = () => {
    clearTimeout(debounceTimer);
  };

  return mainFn;
})();
</script>