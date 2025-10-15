<template>
  <div>
    <div class="profile-form card">
      <h3><span class="material-symbols-outlined">badge</span> Личная информация</h3>
      <div class="input-group">
        <label for="user-surname">Фамилия</label>
        <input type="text" id="user-surname" v-model="localUserInfo.surname">
      </div>
      <div class="input-group">
        <label for="user-name">Имя</label>
        <input type="text" id="user-name" v-model="localUserInfo.name">
      </div>
      <div class="input-group">
        <label for="user-position">Должность</label>
        <input type="text" id="user-position" v-model="localUserInfo.position">
      </div>
      <button @click="saveUserInfo" class="button-primary">
        <span class="material-symbols-outlined">save</span> Сохранить
      </button>
    </div>
    <div class="theme-switcher card">
      <h4><span class="material-symbols-outlined">palette</span> Тема оформления</h4>
      <!-- Здесь будет компонент ThemeSwitcher.vue -->
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
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useMainStore } from '@/stores/mainStore';
import type { UserInfo, AppTheme } from '@/types';

const store = useMainStore();
// localUserInfo автоматически получит тип UserInfo
const localUserInfo = ref<UserInfo>(JSON.parse(JSON.stringify(store.userInfo)));

// Определим тип для массива тем для большей строгости
const themes: { value: AppTheme; label: string; icon: string }[] = [
  { value: 'light', label: 'Светлая', icon: 'light_mode' },
  { value: 'dark', label: 'Тёмная', icon: 'dark_mode' },
  { value: 'comfort', label: 'Комфорт', icon: 'visibility' },
  { value: 'system', label: 'Система', icon: 'devices' },
];

function saveUserInfo() {
  store.userInfo.surname = localUserInfo.value.surname;
  store.userInfo.name = localUserInfo.value.name;
  store.userInfo.position = localUserInfo.value.position;
  store.saveData();
  alert('Информация сохранена!');
}

function changeTheme(themeValue: AppTheme) {
  store.setTheme(themeValue);
}
</script>