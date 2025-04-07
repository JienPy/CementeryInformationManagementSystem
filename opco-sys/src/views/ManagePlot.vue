<template>
  <v-app>
    <!-- App Bar (Top Navigation) -->
    <AppBar />

    <!-- Navigation Drawer (Left Side) -->
    <NavigationDrawer />

    <!-- Main Content Area -->
    <v-main class="mainStyle">
      
      <v-container fluid>
        <v-row>
          <!-- Map container or card here -->
          <v-col >
            <TombsList />
            <!-- <TombManagement /> -->
          </v-col>
          
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>

import AppBar from '../components/AppBar.vue';
import NavigationDrawer from '../components/NavigationDrawer.vue';
import TombsList from '@/components/ManagePlotLayouts/TombsList.vue';

</script>

<style scoped>
.mainStyle {
  background-color: #90A4AE;
}
</style>