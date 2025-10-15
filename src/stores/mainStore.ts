import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Patient, UserInfo, AppTheme } from '@/types' 

const getLocalDateString = (date: Date): string => date.toISOString().slice(0, 10);

export const useMainStore = defineStore('main', () => {
    
    const userInfo = ref<UserInfo>({ surname: '', name: '', position: '' });
    const patients = ref<Patient[]>([]);
    const theme = ref<AppTheme>('system');

    
    const getPatientById = computed(() => {
        return (patientId: string): Patient | undefined => patients.value.find((p: Patient) => p.id === patientId);
    });

    const patientsForToday = computed(() => {
        const todayStr = getLocalDateString(new Date());
        return patients.value.filter(p => {
            const completed = Object.values(p.dates || {}).filter(v => typeof v === 'number').length;
            const hasSurname = p.surname && p.surname.trim() !== '';
            return hasSurname && !p.dates[todayStr] && completed < p.n;
        }).sort((a, b) => (a.time || '23:59').localeCompare(b.time || '23:59'));
    });

    const allPatientsSorted = computed(() => {
        return [...patients.value]
            .filter(p => p.surname && p.surname.trim() !== '')
            .sort((a, b) => a.surname.localeCompare(b.surname));
    });
    
    function saveData(): void {
        const dataToSave = { userInfo: userInfo.value, patients: patients.value, theme: theme.value };
        localStorage.setItem('appData', JSON.stringify(dataToSave));
    }

    function loadData(): void {
        const savedData = localStorage.getItem('appData');
        if (savedData) {
            const data = JSON.parse(savedData);
            userInfo.value = data.userInfo || { surname: '', name: '', position: '' };
            patients.value = data.patients || [];
            theme.value = data.theme || 'system';
        }
    }

    function addPatient(): Patient {
        const newPatient: Patient = {
            id: `patient_${Date.now()}`,
            surname: '', name: '', time: '09:00', room: '',
            department: 'неврология', assignments: [], n: 10, dates: {}
        };
        patients.value.push(newPatient);
        return newPatient;
    }

    function updatePatient(updatedPatient: Patient): void {
        const index = patients.value.findIndex(p => p.id === updatedPatient.id);
        if (index !== -1) {
            patients.value[index] = updatedPatient;
            saveData();
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
        userInfo, patients, theme,
        getPatientById, 
        patientsForToday,    
        allPatientsSorted,   
        saveData, loadData, addPatient, updatePatient, deletePatient, setTheme
    };
});