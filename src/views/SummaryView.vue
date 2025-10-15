<template>
  <div>
    <div id="report-content" class="card report-card">
      <h2 class="report-title">Итоговый отчёт</h2>
      <div class="user-info-report">
        <p v-if="store.userInfo.position">{{ store.userInfo.position }}</p>
        <p v-if="store.userInfo.surname || store.userInfo.name">
          {{ store.userInfo.surname }} {{ store.userInfo.name }}
        </p>
      </div>

      <div class="table-container-report">
        <table id="summary-table">
          <thead>
          <tr>
            <th>Отделение</th>
            <th>Пац.</th>
            <th>Проц.</th>
            <th>Ед.</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(data, dep) in reportData.departments" :key="dep">
            <td>{{ dep }}</td>
            <td>{{ data.patientCount }}</td>
            <td>{{ data.procedureCount }}</td>
            <td>{{ data.unitCount }}</td>
          </tr>
          </tbody>
          <tfoot>
          <tr>
            <th>Итого</th>
            <td>{{ reportData.totals.patientCount }}</td>
            <td>{{ reportData.totals.procedureCount }}</td>
            <td>{{ reportData.totals.unitCount }}</td>
          </tr>
          </tfoot>
        </table>
      </div>
    </div>

    <button @click="exportToPDF" class="button-primary" style="margin-top: 16px;">
      <span class="material-symbols-outlined">picture_as_pdf</span> Экспорт в PDF
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import { getUnitsForAssignment } from '@/utils/constants';
import html2pdf from 'html2pdf.js';

// --- ИМПОРТЫ, КОТОРЫХ НЕ ХВАТАЛО ---
import { useToasts } from '@/composables/useToasts';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';
import { downloadDir } from '@tauri-apps/api/path';

// --- ОБЪЯВЛЕНИЯ, КОТОРЫХ НЕ ХВАТАЛО ---
const store = useMainStore();
const { showToast } = useToasts(); // <- `showToast` теперь объявлена

const reportData = computed(() => {
  const departmentsSummary: Record<string, { patientCount: number; procedureCount: number; unitCount: number }> = {};
  const totals = { patientCount: 0, procedureCount: 0, unitCount: 0 };
  const currentMonthPrefix = new Date().toISOString().slice(0, 7);

  // 1. Сначала собираем статистику по отделениям
  for (const patient of store.patients) {
    if (!patient.assignments || patient.assignments.length === 0 || patient.assignments.includes('Нет')) {
      continue;
    }

    let proceduresThisMonth = 0;
    for (const date in patient.dates) {
      if (date.startsWith(currentMonthPrefix) && patient.dates[date] === 1) { // 1 - выполнено
        proceduresThisMonth++;
      }
    }

    if (proceduresThisMonth === 0) continue;

    const dep = patient.department || 'Без отделения';
    if (!departmentsSummary[dep]) {
      departmentsSummary[dep] = { patientCount: 0, procedureCount: 0, unitCount: 0 };
    }

    const totalUnitsPerProcedure = patient.assignments.reduce((sum, assignment) => {
      return sum + getUnitsForAssignment(assignment);
    }, 0);

    departmentsSummary[dep].patientCount++;
    departmentsSummary[dep].procedureCount += proceduresThisMonth;
    departmentsSummary[dep].unitCount += totalUnitsPerProcedure * proceduresThisMonth;
  }

  // 2. Теперь, на основе собранных данных, вычисляем итоги
  for (const depData of Object.values(departmentsSummary)) {
    totals.patientCount += depData.patientCount;
    totals.procedureCount += depData.procedureCount;
    totals.unitCount += depData.unitCount;
  }

  // 3. Округляем значения УЕТ
  Object.values(departmentsSummary).forEach(data => {
    data.unitCount = parseFloat(data.unitCount.toFixed(1));
  });
  totals.unitCount = parseFloat(totals.unitCount.toFixed(1));

  // 4. Возвращаем единый объект с двумя наборами данных
  return {
    departments: departmentsSummary,
    totals: totals
  };
});

async function exportToPDF() {
  const element = document.getElementById('report-content');
  if (!element) {
    showToast("Ошибка: не найден элемент для экспорта.", "error");
    return;
  }

  const opt = {
    margin: 10,
    filename: 'report.pdf',
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const }
  };

  try {
    const pdfData = await html2pdf().from(element).set(opt).output('arraybuffer');

    // `downloadDir` теперь доступна благодаря импорту
    const defaultPath = await downloadDir();

    const filePath = await save({
      title: 'Сохранить отчет',
      defaultPath: `${defaultPath}/report-${new Date().toISOString().slice(0, 10)}.pdf`,
      filters: [{
        name: 'PDF Document',
        extensions: ['pdf']
      }]
    });

    if (filePath) {
      await writeFile(filePath, pdfData);
      showToast("Отчет успешно сохранен в PDF!", "success");
    }

  } catch (error) {
    console.error("Произошла ошибка при экспорте в PDF:", error);
    showToast("Ошибка при сохранении PDF.", "error"); // `showToast` теперь тоже доступна
  }
}
</script>