import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Patient, UserInfo, AppTheme, ProcedureStatus } from '@/types';

function runMonthlyCourseRollover(patients: Patient[]): Patient[] {
    const today = new Date();
    const currentMonthKey = `${today.getFullYear()}-${today.getMonth()}`; // e.g., "2024-10"
    const lastRolloverKey = localStorage.getItem('lastRolloverMonth');

    // Если пролонгация за текущий месяц уже была, ничего не делаем.
    if (lastRolloverKey === currentMonthKey) {
        return patients;
    }

    const updatedPatients = patients.map(patient => {
        if (!patient.dates) {
            patient.dates = {};
        }

        const completedCount = Object.values(patient.dates).filter(status => status === 1).length;

        if (completedCount < patient.n) {
            const newPatientRecord: Patient = {
                ...patient,
                n: patient.n - completedCount,
                dates: {}
            };
            return newPatientRecord;
        } else {
            return patient;
        }
    });

    localStorage.setItem('lastRolloverMonth', currentMonthKey);
    return updatedPatients;
}

export const useMainStore = defineStore('main', () => {
    const userInfo = ref<UserInfo>({ surname: '', name: '', position: '' });
    const patients = ref<Patient[]>([]);
    const theme = ref<AppTheme>('system');

    const getPatientById = computed(() => {
        return (patientId: string): Patient | undefined => patients.value.find(p => p.id === patientId);
    });

    const patientsForToday = computed(() => {
        const todayStr = new Date().toISOString().slice(0, 10);
        return patients.value
            .filter(p => {
                const hasSurname = p.surname && p.surname.trim() !== '';
                const isDoneToday = p.dates && p.dates[todayStr] !== undefined;
                const isCourseCompleted = (p.dates ? Object.values(p.dates).filter(v => v === 1).length : 0) >= p.n;
                return hasSurname && !isDoneToday && !isCourseCompleted;
            })
            .sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59'));
    });

    const allPatientsSorted = computed(() => {
        return [...patients.value]
            .filter(p => p.surname && p.surname.trim() !== '')
            .sort((a, b) => a.surname.localeCompare(b.surname));
    });

    // === ACTIONS ===
    function saveData(): void {
        const dataToSave = { userInfo: userInfo.value, patients: patients.value, theme: theme.value };
        localStorage.setItem('appData', JSON.stringify(dataToSave));
    }

    function loadData(): void {
        const savedData = localStorage.getItem('appData');
        if (savedData) {
            const data = JSON.parse(savedData);
            userInfo.value = data.userInfo || { surname: '', name: '', position: '' };

            patients.value = runMonthlyCourseRollover(data.patients || []);
            const loadedTheme = data.theme;
            if (loadedTheme === 'light' || loadedTheme === 'dark' || loadedTheme === 'system') {
                theme.value = loadedTheme;
            } else {
                theme.value = 'system';
            }
        }
    }

    function addPatient(): Patient {
        const newPatient: Patient = {
            id: `patient_${Date.now()}`,
            surname: '', name: '', time: '09:00', room: '',
            department: 'Неврология', assignments: [], n: 10, dates: {}
        };
        patients.value.unshift(newPatient);
        saveData();
        return newPatient;
    }

    function updatePatient(updatedPatient: Patient): void {
        const index = patients.value.findIndex(p => p.id === updatedPatient.id);
        if (index !== -1) {
            patients.value[index] = updatedPatient;
            saveData();
        }
    }

    function updateProcedureStatus(patientId: string, status: ProcedureStatus): void {
        const patient = patients.value.find(p => p.id === patientId);
        if (patient) {
            const todayStr = new Date().toISOString().slice(0, 10);
            if (!patient.dates) patient.dates = {};
            patient.dates[todayStr] = status;
            saveData();
        }
    }

    function clearProcedureStatus(patientId: string): void {
        const patient = patients.value.find(p => p.id === patientId);
        if (patient) {
            const todayStr = new Date().toISOString().slice(0, 10);
            if (patient.dates && patient.dates[todayStr] !== undefined) {
                delete patient.dates[todayStr];
                saveData();
            }
        }
    }

    function deletePatient(patientId: string): void {
        patients.value = patients.value.filter(p => p.id !== patientId);
        saveData();
    }

    function setTheme(newTheme: AppTheme): void {
        theme.value = newTheme;
        saveData();
    }

    loadData();

    return {
        userInfo,
        patients,
        theme,
        getPatientById,
        patientsForToday,
        allPatientsSorted,
        saveData,
        loadData,
        addPatient,
        updatePatient,
        deletePatient,
        setTheme,
        updateProcedureStatus,
        clearProcedureStatus
    };
});