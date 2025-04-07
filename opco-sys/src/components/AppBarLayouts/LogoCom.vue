<template>
  <v-toolbar-title>
    <img src="/OCP_logo.png" :style="logoStyle" />
    <span v-if="loading">Loading...</span>
    <span v-else-if="error" class="text-error">{{ error }}</span>
    <span v-else-if="isLoggedIn">{{ systemName }}</span>
    <span v-else>Please log in</span>
  </v-toolbar-title>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// Configuration
const apiUrl = 'http://localhost:8055';
const systemNameEndpoint = `${apiUrl}/items/system_name`;

// Reactive variables
const systemName = ref('');
const loading = ref(true);
const error = ref(null);
const isLoggedIn = ref(false); // Track login state
const logoStyle = ref({
  height: '48px',
  verticalAlign: 'middle',
  marginRight: '10px',
});

// Function to simulate user login
const loginUser  = async () => {
  // Simulate a successful login
  isLoggedIn.value = true;
  await fetchSystemName(); // Fetch system name only after login
};

// Fetch system name
const fetchSystemName = async () => {
  loading.value = true; // Start loading
  error.value = null; // Reset error state
  try {
    const response = await axios.get(systemNameEndpoint);
    const data = response.data.data;
    // Assuming the first item contains the system name
    systemName.value = data[0]?.sys_name || 'No system name available';
  } catch (err) {
    console.error('Error fetching system name:', err);
    error.value = 'Failed to load system name. Please try again later.';
  } finally {
    loading.value = false; // Stop loading in both success and error cases
  }
};

// Simulate login when component is mounted
onMounted(() => {
  loginUser (); // Call loginUser  to simulate user logging in
});
setTimeout(loginUser, 1000);
</script>

<style scoped>
.text-error {
  color: red;
}
</style>