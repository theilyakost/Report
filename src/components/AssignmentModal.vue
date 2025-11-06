<template>
  <div class="modal-overlay" :class="{ active: isOpen }" @click.self="closeModal">
    <div class="modal-content">
      <h3 class="modal-title">ВЫБОР НАЗНАЧЕНИЙ</h3>

      <div class="assignment-options">
        <div v-for="option in allAssignments" :key="option"
             class="assignment-item"
             :class="{ selected: isSelected(option) }"
             @click="toggleSelection(option)">
          {{ option }}
        </div>
      </div>

      <div class="modal-actions">
        <button @click="closeModal" class="button-secondary">ОТМЕНА</button>
        <button @click="saveChanges" class="button-primary">СОХРАНИТЬ</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useHaptics } from '@/composables/useHaptics';
const { triggerSelection, triggerConfirm } = useHaptics();
const props = defineProps<{
  isOpen: boolean;
  allAssignments: string[];
  patientAssignments: string[];
}>();

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save', newAssignments: string[]): void;
}>();

const selectedAssignments = ref<string[]>([]);

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    selectedAssignments.value = [...props.patientAssignments];
  }
});

function isSelected(option: string): boolean {
  return selectedAssignments.value.includes(option);
}

function toggleSelection(option: string): void {
  triggerSelection();
  const index = selectedAssignments.value.indexOf(option);
  if (index > -1) {
    selectedAssignments.value.splice(index, 1);
  } else {
    selectedAssignments.value.push(option);
  }
}

function closeModal(): void {
  triggerSelection();
  emit('close');
}

function saveChanges(): void {
  triggerConfirm();
  emit('save', selectedAssignments.value);
  closeModal();
}
</script>