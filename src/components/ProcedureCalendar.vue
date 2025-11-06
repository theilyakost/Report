<template>
  <div>
    <div class="calendar-controls">
      <button @click="prevMonth" class="header-button" aria-label="Предыдущий месяц">
        <span class="material-symbols-outlined">chevron_left</span>
      </button>
      <span class="month-name">{{ monthName }} {{ currentYear }}</span>
      <button @click="nextMonth" class="header-button" aria-label="Следующий месяц">
        <span class="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
    <div class="procedure-calendar">
      <div v-for="day in weekDays" :key="day" class="calendar-header">{{ day }}</div>
      <div v-for="day in calendarDays" :key="day.fullDate"
           class="calendar-day"
           :class="getDayClasses(day)"
           @click="onDayClick(day)">
        <span v-if="day.isCurrentMonth">{{ day.dayOfMonth }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { Patient, ProcedureStatus } from '@/types';

interface CalendarDay {
  dayOfMonth: number;
  fullDate: string; // Формат YYYY-MM-DD
  isCurrentMonth: boolean;
  isToday: boolean;
}

const props = defineProps<{
  patient: Patient;
}>();

const emit = defineEmits<{
  (e: 'day-click', date: string): void;
}>();

// --- Утилиты для работы с датами ---
function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// --- Состояние компонента ---
const today = new Date();
const todayStr = getLocalDateString(today);
const currentDate = ref(new Date(today.getFullYear(), today.getMonth(), 1));
const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

// --- Вычисляемые свойства ---
const currentYear = computed(() => currentDate.value.getFullYear());
const currentMonth = computed(() => currentDate.value.getMonth());

const monthName = computed(() => {
  const name = currentDate.value.toLocaleString('ru-RU', { month: 'long' });
  return name.toUpperCase(); // Соответствует стилю маркировки
});

const calendarDays = computed((): CalendarDay[] => {
  const days: CalendarDay[] = [];
  const year = currentYear.value;
  const month = currentMonth.value;

  const firstDayOfMonth = new Date(year, month, 1);
  const dayOfWeek = firstDayOfMonth.getDay();
  const startOffset = (dayOfWeek === 0) ? 6 : dayOfWeek - 1;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Заглушки для дней предыдущего месяца
  for (let i = 0; i < startOffset; i++) {
    days.push({ dayOfMonth: 0, fullDate: `prev-${i}`, isCurrentMonth: false, isToday: false });
  }

  // Дни текущего месяца
  for (let i = 1; i <= daysInMonth; i++) {
    const date = new Date(year, month, i);
    const dateStr = getLocalDateString(date);
    days.push({ dayOfMonth: i, fullDate: dateStr, isCurrentMonth: true, isToday: dateStr === todayStr });
  }

  // Заглушки для дней следующего месяца для заполнения сетки 6x7
  while (days.length < 42) {
    days.push({ dayOfMonth: 0, fullDate: `next-${days.length}`, isCurrentMonth: false, isToday: false });
  }

  return days;
});

// --- Методы ---
function getDayClasses(day: CalendarDay) {
  if (!day.isCurrentMonth) {
    return 'not-in-month';
  }
  const status: ProcedureStatus | undefined = props.patient.dates[day.fullDate];
  return {
    'work-day': true,
    'today': day.isToday,
    'complete': status === 1,
    'missed': status === 2,
  };
}

function onDayClick(day: CalendarDay) {
  if (day.isCurrentMonth) {
    emit('day-click', day.fullDate);
  }
}

function prevMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1);
}

function nextMonth() {
  currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1);
}
</script>

<style scoped>
.month-name {
  font-weight: 600;
  font-size: 18px;
  letter-spacing: 1px;
}
</style>