<template>
  <div>
    <div class="card" style="margin-bottom: 16px;">
      <h3>Личная информация</h3>
      <div class="input-group">
        <label for="user-surname">Фамилия</label>
        <input type="text" id="user-surname" v-model.trim="localUserInfo.surname">
      </div>
      <div class="input-group">
        <label for="user-name">Имя</label>
        <input type="text" id="user-name" v-model.trim="localUserInfo.name">
      </div>
      <div class="input-group">
        <label for="user-position">Должность</label>
        <input type="text" id="user-position" v-model.trim="localUserInfo.position">
      </div>
      <button @click="saveUserInfo" class="button-primary">
        <span class="material-symbols-outlined">save</span> Сохранить
      </button>
    </div>

    <div class="theme-switcher card">
      <h4>Тема оформления</h4>
      <div class="theme-buttons-container">
        <button v-for="theme in themes" :key="theme.value"
                class="theme-btn"
                :class="{ active: store.theme === theme.value }"
                @click="changeTheme(theme.value)">
          <span class="material-symbols-outlined">{{ theme.icon }}</span>
          <span>{{ theme.label }}</span>
        </button>
      </div>
    </div>
    <div class="system-info-card">
      <div class="info-row">
        <span class="info-label">СИСТЕМА</span>
        <span class="info-value">PATIENT TRACKER</span>
      </div>
      <div class="info-row">
        <span class="info-label">ВЕРСИЯ</span>
        <span class="info-value">3.0.0-RC1</span>
      </div>
      <div class="info-row">
        <span class="info-label">РАЗРАБОТЧИК</span>
        <span class="info-value">IKON (Ilya Kost)</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import type { UserInfo, AppTheme } from '@/types';
import { useToasts } from '@/composables/useToasts';
import { useHaptics } from '@/composables/useHaptics';

const store = useMainStore();
const { showToast } = useToasts();
const { triggerConfirm } = useHaptics();

const localUserInfo = ref<UserInfo>(JSON.parse(JSON.stringify(store.userInfo)));

const themes: { value: AppTheme; label: string; icon: string }[] = [
  { value: 'light', label: 'Светлая', icon: 'light_mode' },
  { value: 'dark', label: 'Тёмная', icon: 'dark_mode' },
  { value: 'system', label: 'Система', icon: 'devices' },
];
function saveUserInfo() {
  triggerConfirm();
  store.userInfo.surname = localUserInfo.value.surname;
  store.userInfo.name = localUserInfo.value.name;
  store.userInfo.position = localUserInfo.value.position;
  store.saveData();
  showToast('Информация сохранена', 'success');
}

function changeTheme(themeValue: AppTheme) {
  store.setTheme(themeValue);
}
</script>