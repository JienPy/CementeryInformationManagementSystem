<template>
  <div class="dashboard-layout">
    <v-row class="chart-section">
     <PieChart/>
      <SummaryStatistics/>
    </v-row>
    <DashboardCards/>
  </div>
</template>

<script setup>
import DashboardCards from './DashboardCards.vue';
import PieChart from './PieChart/PieChart.vue';
import SummaryStatistics from './SummaryStatistics.vue';


</script>

<style scoped>
.dashboard-layout {
  padding: 24px;
}
.chart-section {
  margin-bottom: 32px;
}
</style>