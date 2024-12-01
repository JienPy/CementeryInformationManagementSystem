<template>
  <v-app>
    <!-- App Bar (Top Navigation) -->
    <AppBar />

    <!-- Navigation Drawer (Left Side) -->
    <NavigationDrawer />

    <v-main :style="mainStyle">
      <v-container fluid>
        <v-row>
          <v-col cols="6"> <!-- Add a column for the DeceaseForm -->
            <DeceaseForm class="mt-0"/>
          </v-col>
            <v-col cols="6"> <!-- Add a column for the data table -->
            <RealTimeDataFlow  class="mt-0"/>
          </v-col>
        </v-row>
      </v-container>
    </v-main>
    
  </v-app>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import AppBar from '../components/AppBar.vue';
import NavigationDrawer from '../components/NavigationDrawer.vue';
import DeceaseForm from '@/components/IntermentView/DeceaseForm.vue'; // corrected import
import RealTimeDataFlow from '@/components/IntermentView/RealTimeDataFlow.vue';

const drawerOpen = ref(false);
const mainStyle = computed(() => ({

  backgroundColor: '#90A4AE',
}));

const userEmail = ref('');
const authToken = ref(localStorage.getItem('auth-token'));

onMounted(async () => {
  if (!authToken.value) {
    // If no token, redirect to login page or handle authentication flow
    console.log('No authentication token found. Redirecting to login page...');
    // Add your login page redirect logic here
  } else {
    // Use the token to make authenticated requests
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken.value}`;
    // Make API requests or perform authenticated actions
    console.log('Authentication token:', authToken.value);

  }
});
</script>

<style scoped>
.radius-input .v-input__control {
  border-radius: 60px; /* adjust the radius value as needed */
}
.form-group {
  border-radius: 80px;
}
.v-card--variant-elevated, .v-card--variant-flat {
  background-color: #ECEFF1;
  border-radius: 20px;
  color: rgba(0, 0, 0, 0.87);
}

.v-card.form-background {
  /* Add a soft, rounded corner radius */
  border-radius: 20px;
  
  /* Remove the box shadow and add a subtle elevation */
  box-shadow: none;
  
  /* Add a soft, pastel background color */
  background-color: #F7F7F7;
  
  /* Add some padding to create a sense of depth */
  padding: 20px;
  
  /* Add a subtle border to define the card boundaries */
  border: 1px solid #E5E5E5;
}

.v-card.form-background:hover {
  /* On hover, add a slight elevation and a soft shadow */
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>