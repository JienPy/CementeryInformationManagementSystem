<template>
  <v-sheet class="analytics-dashboard pa-6" elevation="3" rounded="lg">
  <!-- Container Div -->
  <div class="container">
    <!-- Form -->
    <v-form class="form">
      <!-- Data Table -->
      <v-data-table
        :headers="headers"
        :items="dataFlow"
        :sort-by="[{ key: 'first_name', order: 'asc' }]"
      >
        <!-- Template for Table Top -->
        <template v-slot:top>
          <!-- Toolbar -->
          <v-toolbar flat>
            <!-- Toolbar Title -->
            <v-toolbar-title>Real Time Data Flow</v-toolbar-title>
            <!-- Spacer -->
            <v-spacer></v-spacer>
            <!-- Refresh Button -->
            <v-btn color="primary" dark @click="refreshData">Refresh</v-btn>
            <!-- Button to navigate to data-index route -->
            <v-btn icon :to="{ name: 'data-index' }">
              <!-- Icon -->
              <v-icon>mdi-database-search</v-icon>
            </v-btn>
          </v-toolbar>
        </template>
      </v-data-table>
    </v-form>
  </div>
</v-sheet>
</template>

<script setup>
  // Import Vue functions
  import { ref, onMounted } from 'vue';
  // Import axios for HTTP requests
  import axios from 'axios';
  // Import useRouter for route navigation
  import { useRouter } from 'vue-router';

  // API URL
  const apiUrl = 'http://localhost:8055';
  // Burial Records Endpoint
  const burialRecordsEndpoint = `${apiUrl}/items/burial_records`;
  // Router instance
  const router = useRouter();
  // Authentication Token
  const authToken = ref(localStorage.getItem('auth-token'));

  // Data Flow Array
  const dataFlow = ref([]);

  // On Mounted Lifecycle Hook
  onMounted(async () => {
    // Check if authentication token exists
    if (!authToken.value) {
      console.log('No authentication token found. Redirecting to login page...');
      router.push('/login');
    } else {
      // Set Authorization header for axios
      axios.defaults.headers.common['Authorization'] = `Bearer ${authToken.value}`;
      console.log('Authentication token:', authToken.value);
      await fetchBurialRecords();
    }
  });

  const fetchBurialRecords = async () => {
    try {
      // Get burial records from API
      const response = await axios.get(burialRecordsEndpoint);
      const data = response.data.data;
      // Get today's date
      const today = new Date();

      // Format data for table
      const formattedData = data.map((item) => {
        const yearCovered = new Date(item.year_covered);
        
        // Calculate days passed since year covered
        const daysPassed = yearCovered > today ? 0 : Math.floor((today - yearCovered) / (1000 * 60 * 60 * 24));

        // Calculate days left until expiration
        const daysLeft = Math.max(Math.floor((yearCovered - today) / (1000 * 60 * 60 * 24)), 0);

        return {
          first_name: item.first_name,
          middle_name: item.middle_name,
          last_name: item.last_name,
          address: item.address,
          date_of_death: item.date_of_death,
          location: item.location,
          contact_person: item.contact_person,
          renewal: item.renew,
          days_passed: daysPassed,
          days_left: daysLeft,
        };
      });

      // Update dataFlow array
      dataFlow.value = formattedData;
    } catch (error) {
      console.error(error);
    }
  };

  // Headers for Data Table
  const headers = ref([
    { title: 'Last Name', key: 'last_name', minWidth: '130px', resizable: true, sortable: true, align: 'center' },
    { title: 'First Name', key: 'first_name', minWidth: '130px', resizable: true, sortable: true, align: 'center' },
    { title: 'Middle Name', key: 'middle_name', minWidth: '100px', resizable: true, align: 'center' },
    { title: 'Address', key: 'address', minWidth: '100px', resizable: true, align: 'center' },
    { title: 'Date of Death', key: 'date_of_death', minWidth: '140px', resizable: true, sortable: true, align: 'center' },
    { title: 'Location', key: 'location', width: '50px', resizable: true, align: 'center' },
    { title: 'Contact Person', key: 'contact_person', minWidth: '140px', resizable: true, align: 'center' },
    { title: 'Renewal', key: 'renewal', width: '150px', resizable: true, align: 'center' },
    { title: 'Days Passed', key: 'days_passed', minWidth: '100px', resizable: true, align: 'center' },
    { title: 'Days Left', key: 'days_left', minWidth: '100px', resizable: true, align: 'center' },
  ]);

  const refreshData = async () => {
    await fetchBurialRecords();
  };
</script>