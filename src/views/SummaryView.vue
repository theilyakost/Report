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
      <span class="material-symbols-outlined">picture_as_pdf</span>
      Экспорт в PDF
    </button>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import { getUnitsForAssignment } from '@/utils/constants';
import { writeFile } from '@tauri-apps/plugin-fs';
import { save } from '@tauri-apps/plugin-dialog';
import { downloadDir } from '@tauri-apps/api/path';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToasts } from '@/composables/useToasts';

const store = useMainStore();
const { showToast } = useToasts();

const reportData = computed(() => {
  const departmentsSummary: Record<string, { patientCount: number; procedureCount: number; unitCount: number }> = {};
  const totals = { patientCount: 0, procedureCount: 0, unitCount: 0 };
  const currentMonthPrefix = new Date().toISOString().slice(0, 7);

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

  for (const depData of Object.values(departmentsSummary)) {
    totals.patientCount += depData.patientCount;
    totals.procedureCount += depData.procedureCount;
    totals.unitCount += depData.unitCount;
  }

  Object.values(departmentsSummary).forEach(data => {
    data.unitCount = parseFloat(data.unitCount.toFixed(1));
  });
  totals.unitCount = parseFloat(totals.unitCount.toFixed(1));

  return {
    departments: departmentsSummary,
    totals: totals
  };
});


function applyPrintStyles(element: HTMLElement) {
  element.setAttribute('data-original-style', element.getAttribute('style') || '');
  element.style.backgroundColor = '#ffffff';
  element.style.color = '#000000';
  element.style.border = '1px solid #dddddd';
  element.style.boxShadow = 'none';

  const children = element.querySelectorAll('*') as NodeListOf<HTMLElement>;
  children.forEach(child => {
    child.setAttribute('data-original-style', child.getAttribute('style') || '');
    child.style.backgroundColor = 'transparent';
    child.style.color = '#000000';
    child.style.borderColor = '#dddddd';
    child.style.borderBottomColor = '#dddddd';
  });

  const tableContainer = element.querySelector('.table-container-report') as HTMLElement;
  if (tableContainer && tableContainer.scrollWidth > tableContainer.clientWidth) {
    console.log("AEGIS PROTOCOL: Overflow detected. Adjusting render width.");
    element.style.width = `${tableContainer.scrollWidth}px`;
    tableContainer.style.overflowX = 'visible';
  }
}

function restoreOriginalStyles(element: HTMLElement) {
  element.setAttribute('style', element.getAttribute('data-original-style') || '');
  element.removeAttribute('data-original-style');

  const children = element.querySelectorAll('*') as NodeListOf<HTMLElement>;
  children.forEach(child => {
    child.setAttribute('style', child.getAttribute('data-original-style') || '');
    child.removeAttribute('data-original-style');
  });
}

async function exportToPDF() {
  const element = document.getElementById('report-content');
  if (!element) {
    showToast("Ошибка: не найден элемент для экспорта.", "error");
    return;
  }

  applyPrintStyles(element); // перекрашиваем под печать

  try {
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

    const pdfArray = pdf.output('arraybuffer');

    const defaultPath = await downloadDir();
    const filePath = await save({
      title: 'Сохранить отчет',
      defaultPath: `${defaultPath}/report-${new Date().toISOString().slice(0, 10)}.pdf`,
      filters: [{ name: 'PDF Document', extensions: ['pdf'] }]
    });

    if (filePath) {
      await writeFile(filePath, new Uint8Array(pdfArray));
      showToast("Отчет успешно сохранен в PDF!", "success");
    }
  } catch (err) {
    console.error('Ошибка при экспорте PDF:', err);
    showToast("Ошибка при сохранении PDF.", "error");
  } finally {
    restoreOriginalStyles(element);
  }
}
</script>