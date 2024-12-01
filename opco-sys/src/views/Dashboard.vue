<template>
  <v-app>
    <AppBar />
    <NavigationDrawer />
    <v-main class="top-background">
      <v-container fluid>
        <SummaryList data-aos="fade-up" />
        <v-divider :thickness="4" class="border-opacity-40" style="padding: 10px 0;"></v-divider>
        <v-row>
          <v-col cols="12" md="8">
            <DeathsLineChart data-aos="fade-left" />
          </v-col>
          <v-col cols="12" md="4">
            <MonitoringTombsMap data-aos="fade-right" />
          </v-col>
        </v-row>
        <SummaryDataFlow class="summary-data-flow-gap" data-aos="fade-up" />
      </v-container>
    </v-main>
    <div class="full-background"></div>
    <DeathCountBubble /> <!-- Add the floating bubble component here -->
  </v-app>
</template>

<script setup>
import { onMounted } from 'vue';
import AOS from 'aos';
import 'aos/dist/aos.css';

import AppBar from '../components/AppBar.vue';
import NavigationDrawer from '../components/NavigationDrawer.vue';

import SummaryList from '@/components/DashboardLayouts/SummaryList.vue';
import SummaryDataFlow from '@/components/DashboardLayouts/SummaryDataFlow.vue';
import MonitoringTombsMap from '@/components/DashboardLayouts/MonitoringTombsMap.vue';

import DeathsLineChart from '@/components/DashboardLayouts/DeathsLineChart.vue';
import DeathCountBubble from '@/components/DeathCountBubble.vue'; // Import the new component

onMounted(() => {
  AOS.init();
});
</script>

<style scoped>
.summary-data-flow-gap {
  margin-top: 20px; /* Adjust this value as needed for the desired gap */
}
.top-background {
  background-image: url('/cemetery-bg.png');
  background-size: cover;
  background-position: center;
  height: 300px;
  width: 100%;
}
.full-background {
  background-color: #1b0d0d;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: -1;
}
.soft-ui-card {
  background-color: #ECEFF1;
  border-radius: 15px;
  padding: 20px;
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.1), -5px -5px 10px rgba(255, 255, 255, 0.1);
  transition: box-shadow 0.3s ease;
}
.soft-ui-card:hover {
  box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.1), -5px -5px 10px rgba(255, 255, 255, 0.1);
}
.title {
  font-size: 1em;
}
</style>