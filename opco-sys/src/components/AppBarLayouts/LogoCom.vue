<template>
    <v-toolbar-title>
      <img src="/OCP_logo.png" :style="logoStyle" />
      {{ title }}
    </v-toolbar-title>
  </template>
  
  <script setup>
  import { ref } from 'vue';
  import { useRoute } from 'vue-router';
  const title = ref('TAYABAS CITY - OPCO');
  const logoStyle = ref({
    height: '48px',
    verticalAlign: 'middle',
    marginRight: '10px',
  });
  </script>