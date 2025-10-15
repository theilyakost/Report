<template>
  <nav class="bottom-nav">
    <router-link to="/" class="nav-button" active-class="active">
      <span class="material-symbols-outlined">groups</span>
      <span>Пациенты</span>
    </router-link>
    <router-link to="/summary" class="nav-button" active-class="active">
      <span class="material-symbols-outlined">summarize</span>
      <span>Отчёт</span>
    </router-link>
    <router-link to="/profile" class="nav-button" active-class="active">
      <span class="material-symbols-outlined">settings</span>
      <span>Профиль</span>
    </router-link>
  </nav>
</template>