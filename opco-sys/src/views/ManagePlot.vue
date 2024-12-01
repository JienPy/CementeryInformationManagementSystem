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
      
          </v-col>
          
        </v-row>
      </v-container>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import AppBar from '../components/AppBar.vue';
import NavigationDrawer from '../components/NavigationDrawer.vue';
import TombsList from '@/components/ManagePlotLayouts/TombsList.vue';

const authToken = ref(localStorage.getItem('auth-token'));

onMounted(async () => {
  if (!authToken.value) {
    console.log('No authentication token found. Redirecting to login page...');
    // Add your login page redirect logic here
  } else {
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken.value}`;
    console.log('Authentication token:', authToken.value);
  
  }
});
</script>

<style scoped>
.mainStyle {
  background-color: #90A4AE;
}
</style>