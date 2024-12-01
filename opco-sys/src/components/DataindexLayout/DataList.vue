<template>
  <v-card class="records-dashboard">
    <!-- Enhanced Header Section -->
    <header class="dashboard-header">
      <div class="d-flex align-center pa-6">
        <v-btn
          icon="mdi-arrow-left"
          variant="text"
          size="large"
          @click="$router.go(-1)"
          class="mr-4 text-white"
        />
        <div>
          <h1 class="text-h4 font-weight-bold text-white mb-1">Deceased Records</h1>
          <span class="text-caption text-white">Manage and track burial records</span>
        </div>
      </div>
    </header>

    <div class="px-6 pb-6">
      <!-- Enhanced Control Panel -->
      <v-card class="control-panel mb-6" elevation="1">
        <div class="d-flex flex-wrap gap-4 align-center pa-4">
          <!-- Improved Search Section -->
          <div class="search-wrapper">
            <v-text-field
              v-model="search"
              prepend-inner-icon="mdi-magnify"
              label="Search Records"
              placeholder="Search by name, location, or ID..."
              single-line
              hide-details
              variant="outlined"
              density="comfortable"
              class="search-field"
            />
          </div>

          <!-- Enhanced Filter Button -->
          <v-menu v-model="filterMenu" :close-on-content-click="false">
            <template v-slot:activator="{ props }">
              <v-btn
                v-bind="props"
                prepend-icon="mdi-filter-variant"
                color="primary"
                variant="outlined"
                class="filter-btn"
              >
                Filters
                <v-chip
                  v-if="activeFilters > 0"
                  class="ml-2"
                  size="small"
                  color="primary"
                >
                  {{ activeFilters }}
                </v-chip>
              </v-btn>
            </template>

            <v-card min-width="300" class="filter-menu">
              <v-card-title class="d-flex justify-space-between align-center pa-4">
                <span class="text-h6">Filter Records</span>
                <v-btn
                  variant="text"
                  density="comfortable"
                  color="primary"
                  @click="clearFilters"
                >
                  Clear All
                </v-btn>
              </v-card-title>
              
              <v-divider></v-divider>

              <v-card-text class="pa-4">
                <v-select
                  v-model="filters.gender"
                  label="Gender"
                  :items="['male', 'female']"
                  clearable
                  class="mb-4"
                  variant="outlined"
                />
                
                <v-select
                  v-model="filters.indigent"
                  label="Indigent Status"
                  :items="['yes', 'no']"
                  clearable
                  class="mb-4"
                  variant="outlined"
                />

                <v-text-field
                  v-model="filters.location"
                  label="Location"
                  clearable
                  class="mb-4"
                  variant="outlined"
                />

                <v-range-slider
                  v-model="filters.ageRange"
                  label="Age Range"
                  min="0"
                  max="120"
                  strict
                  class="mt-6"
                  thumb-label
                  color="primary"
                />
              </v-card-text>
            </v-card>
          </v-menu>

          <v-spacer />

          <!-- Export Button -->
          <v-btn
            prepend-icon="mdi-download"
            color="success"
            variant="tonal"
            @click="exportToCSV"
            class="export-btn"
          >
            Export Data
          </v-btn>
        </div>
      </v-card>

      <!-- Enhanced Data Table -->
      <v-data-table
        :headers="headers"
        :items="filteredData"
        :sort-by="[{ key: 'first_name', order: 'asc' }]"
        :custom-sort="customSort"
        :loading="isLoading"
        loading-text="Loading records..."
        hover
        class="records-table"
      >
        <!-- Custom header styling -->
        <template v-slot:header="{ props }">
          <tr>
            <th
              v-for="header in props.headers"
              :key="header.key"
              class="text-primary font-weight-bold"
            >
              {{ header.title }}
            </th>
          </tr>
        </template>

        <!-- Enhanced Status column -->
        <template v-slot:item.days_left="{ item }">
          <v-chip
            :color="getDaysLeftColor(item.days_left)"
            size="small"
            class="font-weight-medium status-chip"
          >
            {{ item.days_left }} days
          </v-chip>
        </template>

        <!-- Enhanced Actions column -->
        <template v-slot:item.actions="{ item }">
          <div class="d-flex gap-2 justify-center">
            <v-tooltip text="Edit Record" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-pencil"
                  variant="text"
                  color="primary"
                  size="small"
                  @click="editItem(item)"
                />
              </template>
            </v-tooltip>
            <v-tooltip text="Delete Record" location="top">
              <template v-slot:activator="{ props }">
                <v-btn
                  v-bind="props"
                  icon="mdi-delete"
                  variant="text"
                  color="error"
                  size="small"
                  @click="deleteItem(item)"
                />
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </div>

    <!-- Enhanced Edit Dialog -->
    <v-dialog v-model="dialog" max-width="1200px" persistent>
      <v-card class="edit-dialog">
        <v-toolbar color="primary" class="text-h5 text-white">
          {{ formTitle }}
          <v-spacer></v-spacer>
          <v-btn icon="mdi-close" variant="text" @click="close" class="text-white" />
        </v-toolbar>

        <v-card-text class="pa-6">
          <v-form ref="form" v-model="valid" lazy-validation>
            <v-row>
              <!-- Personal Information Section -->
              <v-col cols="12">
                <div class="text-h6 mb-4">Personal Information</div>
                <v-row>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="editedItem.first_name"
                      label="First Name"
                      variant="outlined"
                      density="comfortable"
                      :rules="[(v) => !!v || 'First name is required']"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="editedItem.middle_name"
                      label="Middle Name"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="editedItem.last_name"
                      label="Last Name"
                      variant="outlined"
                      density="comfortable"
                      :rules="[(v) => !!v || 'Last name is required']"
                      required
                    />
                  </v-col>
                </v-row>
              </v-col>

              <!-- Demographics Section -->
              <v-col cols="12">
                <div class="text-h6 mb-4">Demographics</div>
                <v-row>
                  <v-col cols="12" md="3">
                    <v-text-field
                      v-model="editedItem.age"
                      label="Age"
                      type="number"
                      variant="outlined"
                      density="comfortable"
                      :rules="[
                        (v) => !!v || 'Age is required',
                        (v) => v > 0 || 'Age must be greater than 0'
                      ]"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-select
                      v-model="editedItem.gender"
                      label="Gender"
                      :items="['male', 'female']"
                      variant="outlined"
                      density="comfortable"
                      :rules="[(v) => !!v || 'Gender is required']"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-select
                      v-model="editedItem.indigent"
                      label="Indigent Status"
                      :items="['yes', 'no']"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-text-field
                      v-model="editedItem.address"
                      label="Address"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                </v-row>
              </v-col>

              <!-- Dates Section -->
              <v-col cols="12">
                <div class="text-h6 mb-4">Important Dates</div>
                <v-row>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="editedItem.date_of_birth"
                      label="Date of Birth"
                      type="date"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="editedItem.date_of_death"
                      label="Date of Death"
                      type="date"
                      variant="outlined"
                      density="comfortable"
                      :rules="[(v) => !!v || 'Date of death is required']"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="editedItem.date_of_renewal"
                      label="Date of Renewal"
                      type="date"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                </v-row>
              </v-col>

              <!-- Location & Contact Section -->
              <v-col cols="12">
                <div class="text-h6 mb-4">Location & Contact Information</div>
                <v-row>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="editedItem.location"
                      label="Location"
                      variant="outlined"
                      density="comfortable"
                      :rules="[(v) => !!v || 'Location is required']"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="editedItem.contact_person"
                      label="Contact Person"
                      variant="outlined"
                      density="comfortable"
                      :rules="[(v) => !!v || 'Contact person is required']"
                      required
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="editedItem.graveyard_id"
                      label="Graveyard ID"
                      variant="outlined"
                      density="comfortable"
                      :rules="[(v) => !!v || 'Graveyard ID is required']"
                      required
                    />
                  </v-col>
                </v-row>
              </v-col>

              <!-- Payment & Transfer Section -->
              <v-col cols="12">
                <div class="text-h6 mb-4">Payment & Transfer Details</div>
                <v-row>
                  <v-col cols="12" md="3">
                    <v-text-field
                      v-model="editedItem.amount"
                      label="Amount"
                      type="number"
                      variant="outlined"
                      density="comfortable"
                      prefix="₱"
                      :rules="[(v) => v >= 0 || 'Amount must be non-negative']"
                    />
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-text-field
                      v-model="editedItem.or_number"
                      label="OR Number"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-text-field
                      v-model="editedItem.transfer"
                      label="Transfer"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" md="3">
                    <v-text-field
                      v-model="editedItem.new_user_of_burial"
                      label="New User of Burial"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                </v-row>
              </v-col>

              <!-- Additional Details Section -->
              <!-- Additional Details Section -->
              <v-col cols="12">
                <div class="text-h6 mb-4">Additional Details</div>
                <v-row>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="editedItem.ab_stores_tomb"
                      label="AB Stores Tomb"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="editedItem.bone_vault"
                      label="Bone Vault"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" md="4">
                    <v-text-field
                      v-model="editedItem.year_covered"
                      label="Year Covered"
                      type="date"
                      variant="outlined"
                      density="comfortable"
                      :rules="[(v) => !!v || 'Year covered is required']"
                      required
                    />
                  </v-col>
                </v-row>
              </v-col>

              <!-- Renewal Status Section -->
              <v-col cols="12">
                <div class="text-h6 mb-4">Renewal Status</div>
                <v-row>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="editedItem.renew"
                      label="Renewal Status"
                      :items="['Pending', 'Completed', 'Not Required']"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-text-field
                      v-model="editedItem.days_left"
                      label="Days Left"
                      type="number"
                      variant="outlined"
                      density="comfortable"
                      readonly
                    />
                  </v-col>
                </v-row>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>

        <v-divider />

        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey"
            @click="close"
          >
            Cancel
          </v-btn>
          <v-btn
            color="primary"
            class="ml-4"
            @click="save"
            :disabled="!valid"
            :loading="saving"
          >
            Save Record
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Delete Confirmation Dialog -->
    <v-dialog v-model="dialogDelete" max-width="500px">
      <v-card class="confirm-dialog">
        <v-card-title class="text-h5 pa-6">Delete Confirmation</v-card-title>
        <v-card-text class="pa-6">
          Are you sure you want to delete this record? This action cannot be undone.
        </v-card-text>
        <v-card-actions class="pa-4">
          <v-spacer />
          <v-btn
            variant="outlined"
            color="grey"
            @click="closeDelete"
          >
            Cancel
          </v-btn>
          <v-btn
            color="error"
            class="ml-4"
            @click="deleteItemConfirm"
            :loading="deleting"
          >
            Confirm Delete
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Success Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="3000"
      location="top"
    >
      {{ snackbar.text }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="snackbar.show = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<script setup>
import { ref, onMounted, nextTick, computed, watch } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const apiUrl = 'http://localhost:8055';
const burialRecordsEndpoint = `${apiUrl}/items/burial_records`;
const router = useRouter();
const authToken = ref(localStorage.getItem('auth-token'));

const search = ref(''); // Search field
const options = ref({}); // For managing table sorting
const isLoading = ref(true);
const headers = ref([
  { title: 'First Name', key: 'first_name', minWidth: '130px', resizable: true, sortable: true, align: 'center'  },
  { title: 'Middle Name', key: 'middle_name', minWidth: '140px', resizable: true, align: 'center'  },
  { title: 'Last Name', key: 'last_name', minWidth: '130px', resizable: true, sortable: true, align: 'center'  },
  { title: 'Age', key: 'age', width: '100px', resizable: true, sortable: true , align: 'center'  },
  { title: 'Gender', key: 'gender', width: '100px', resizable: true, align: 'center'  },
  { title: 'Indigent', key: 'indigent', width: '100px', resizable: true, align: 'center'  },
  { title: 'Address', key: 'address', minWidth: '200px', resizable: true, align: 'center'  },
  { title: 'Date of Birth', key: 'date_of_birth', minWidth: '140px', resizable: true, align: 'center'  },
  { title: 'Date of Death', key: 'date_of_death', minWidth: '140px', resizable: true, align: 'center'  },
  { title: 'Date of Renewal', key: 'date_of_renewal', minWidth: '160px', resizable: true, align: 'center'  },
  { title: 'Transfer', key: 'transfer', width: '150px', resizable: true, align: 'center'  },
  { title: 'New User of Burial', key: 'new_user_of_burial', minWidth: '170px', resizable: true, align: 'center'  },
  { title: 'Location', key: 'location', width: '150px', resizable: true, align: 'center'  },
  { title: 'Contact Person', key: 'contact_person', minWidth: '150px', resizable: true, align: 'center'  },
  { title: 'Amount', key: 'amount', width: '100px', resizable: true, sortable: true, align: 'center'  },
  { title: 'AB Stores Tomb', key: 'ab_stores_tomb', minwidth: '300px', resizable: true, align: 'center'  },
  { title: 'Bone Vault', key: 'bone_vault', width: '150px', resizable: true, align: 'center'  },
  { title: 'Graveyard ID', key: 'graveyard_id', width: '150px', resizable: true, align: 'center'  },
  { title: 'OR Number', key: 'or_number', width: '100px', resizable: true, align: 'center'  },
  { title: 'Renew', key: 'renew', width: '100px', resizable: true, align: 'center'  },
  { title: 'Year Covered', key: 'year_covered', width: '100px', resizable: true, align: 'center'  },
  { title: 'Days Passed', key: 'days_passed', minWidth: '100px', resizable: true, align: 'center' },
  { title: 'Days Left', key: 'days_left', minWidth: '100px', resizable: true, align: 'center' },
  { title: 'Actions', key: 'actions', minWidth: '100px', resizable: true, align: 'center'  },
]);

const dataFlow = ref([]);
const formTitle = ref('');


// Add new refs for loading states and snackbar
const saving = ref(false);
const deleting = ref(false);
const valid = ref(true);
const snackbar = ref({
  show: false,
  text: '',
  color: 'success'
});

// Update the save function to include loading state and error handling
async function save() {
  if (!valid.value) return;
  
  saving.value = true;
  try {
    if (editedIndex.value > -1) {
      const response = await axios.patch(
        `${burialRecordsEndpoint}/${editedItem.value.id}`, 
        editedItem.value
      );
      Object.assign(dataFlow.value[editedIndex.value], response.data.data);
      showSnackbar('Record updated successfully', 'success');
    } else {
      const response = await axios.post(burialRecordsEndpoint, editedItem.value);
      dataFlow.value.push(response.data.data);
      showSnackbar('Record created successfully', 'success');
    }
    close();
  } catch (error) {
    console.error(error);
    showSnackbar(
      error.response?.data?.message || 'An error occurred while saving',
      'error'
    );
  } finally {
    saving.value = false;
  }
}


const dialog = ref(false);
const dialogDelete = ref(false);
const editedIndex = ref(-1);
const editedItem = ref({
  first_name: '',
  middle_name: '',
  last_name: '',
  age: '',
  gender: '',
  indigent: '',
  address: '',
  date_of_birth: '',
  date_of_death: '',
  date_of_renewal: '',
  transfer: '',
  new_user_of_burial: '',
  location: '',
  contact_person: '',
  amount: '',
  ab_stores_tomb: '',
  bone_vault: '',
  graveyard_id: '',
  or_number: '',
  renew: '',
  year_covered: '',
});

const defaultItem = ref({
  first_name: '',
  middle_name: '',
  last_name: '',
  age: '',
  gender: '',
  indigent: '',
  address: '',
  date_of_birth: '',
  date_of_death: '',
  date_of_renewal: '',
  transfer: '',
  new_user_of_burial: '',
  location: '',
  contact_person: '',
  amount: '',
  ab_stores_tomb: '',
  bone_vault: '',
  graveyard_id: '',
  or_number: '',
  renew: '',
  year_covered: '',
});

// New refs for filters
const filterMenu = ref(false);
const filters = ref({
  gender: null,
  indigent: null,
  location: '',
  ageRange: [0, 120]
});

// Computed property for active filters count
const activeFilters = computed(() => {
  return Object.values(filters.value).filter(val => {
    if (Array.isArray(val)) {
      return val[0] !== 0 || val[1] !== 120;
    }
    return val !== null && val !== '';
  }).length;
});

// Update the filteredData computed property with proper type checking
const filteredData = computed(() => {
  return dataFlow.value.filter(item => {
    // First apply search filter
    const searchTerm = search.value.toLowerCase();
    
    // Helper function to safely convert any value to string
    const safeString = (value) => {
      if (value === null || value === undefined) return '';
      return String(value).toLowerCase();
    };

    // Check if any of the fields match the search term
    const matchesSearch = searchTerm === '' || [
      safeString(item.first_name),
      safeString(item.middle_name),
      safeString(item.last_name),
      safeString(item.address),
      safeString(item.location),
      safeString(item.contact_person),
      safeString(item.graveyard_id),
      safeString(item.or_number),
      safeString(item.ab_stores_tomb),
      // Add more fields as needed
    ].some(field => field.includes(searchTerm));

    // Then apply other filters
    const matchesGender = !filters.value.gender || item.gender === filters.value.gender;
    const matchesIndigent = !filters.value.indigent || item.indigent === filters.value.indigent;
    const matchesLocation = !filters.value.location || 
      safeString(item.location).includes(filters.value.location.toLowerCase());
    const matchesAge = item.age >= filters.value.ageRange[0] && 
      item.age <= filters.value.ageRange[1];

    return matchesSearch && matchesGender && matchesIndigent && matchesLocation && matchesAge;
  });
});

// Add debouncing for search input
let searchTimeout;
watch(search, (newValue) => {
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    // The filteredData computed property will automatically update
    // when search.value changes
  }, 300); // 300ms delay for better performance
});

// Function to clear filters
const clearFilters = () => {
  filters.value = {
    gender: null,
    indigent: null,
    location: '',
    ageRange: [0, 120]
  };
};

// Function to get color for days left chip
const getDaysLeftColor = (days) => {
  if (days <= 30) return 'error';
  if (days <= 90) return 'warning';
  return 'success';
};

function editItem(item) {
  editedIndex.value = dataFlow.value.indexOf(item);
  editedItem.value = Object.assign({}, item);
  dialog.value = true;
}

function deleteItem(item) {
  editedIndex.value = dataFlow.value.indexOf(item);
  editedItem.value = Object.assign({}, item);
  dialogDelete.value = true;
}

// Update delete confirmation to include loading state
async function deleteItemConfirm() {
  deleting.value = true;
  try {
    await axios.delete(`${burialRecordsEndpoint}/${editedItem.value.id}`);
    dataFlow.value.splice(editedIndex.value, 1);
    showSnackbar('Record deleted successfully', 'success');
    closeDelete();
  } catch (error) {
    console.error(error);
    showSnackbar(
      error.response?.data?.message || 'An error occurred while deleting',
      'error'
    );
  } finally {
    deleting.value = false;
  }
}

function close() {
  dialog.value = false;
  nextTick(() => {
    editedItem.value = Object.assign({}, defaultItem.value);
    editedIndex.value = -1;
  });
}

function closeDelete() {
  dialogDelete.value = false;
  nextTick(() => {
    editedItem.value = Object.assign({}, defaultItem.value);
    editedIndex.value = -1;
  });
}



onMounted(async () => {
  if (!authToken.value) {
    console.log('No authentication token found. Redirecting to login page...');
    router.push('/login');
  } else {
    axios.defaults.headers.common['Authorization'] = `Bearer ${authToken.value}`;
    try {
      const response = await axios.get(burialRecordsEndpoint);
      const data = response.data.data;
      const today = new Date();

      dataFlow.value = data.map((item) => {
        const yearCovered = new Date(item.year_covered);
        
        // Calculate days passed since year covered
        const daysPassed = yearCovered > today ? 0 : Math.floor((today - yearCovered) / (1000 * 60 * 60 * 24));

        // Calculate days left until expiration
        const daysLeft = Math.max(Math.floor((yearCovered - today) / (1000 * 60 * 60 * 24)), 0);

        return {
          id: item.id,
          first_name: item.first_name,
          middle_name: item.middle_name,
          last_name: item.last_name,
          age: item.age,
          gender: item.gender,
          indigent: item.indigent,
          address: item.address,
          date_of_birth: item.date_of_birth,
          date_of_death: item.date_of_death,
          date_of_renewal: item.date_of_renewal,
          transfer: item.transfer,
          new_user_of_burial: item.new_user_of_burial,
          location: item.location,
          contact_person: item.contact_person,
          amount: item.amount,
          ab_stores_tomb: item.ab_stores_tomb,
          bone_vault: item.bone_vault,
          graveyard_id: item.graveyard_id,
          or_number: item.or_number,
          renew: item.renew,
          year_covered: item.year_covered,
          days_passed: daysPassed,
          days_left: daysLeft,
        };
      });
      isLoading.value = false;
    } catch (error) {
      console.error(error);
    }
  }
});

// Custom sorting logic
const customSort = (items, sortBy, sortDesc) => {
  if (sortBy.length === 0) return items;

  const sorted = items.slice().sort((a, b) => {
    const sortKey = sortBy[0];
    const isDesc = sortDesc[0];
    if (a[sortKey] < b[sortKey]) return isDesc ? 1 : -1;
    if (a[sortKey] > b[sortKey]) return isDesc ? -1 : 1;
    return 0;
  });

  return sorted;
};

// Export data to CSV
const exportToCSV = () => {
  const csvContent = [
    headers.value.map(header => header.title).join(','),
    ...dataFlow.value.map(item => 
      headers.value.map(header => item[header.key]).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
 const a = document.createElement('a');
  a.href = url;
  a.download = 'deceased_records.csv';
  a.click();
  URL.revokeObjectURL(url);
};

// Helper function to show snackbar
function showSnackbar(text, color = 'success') {
  snackbar.value = {
    show: true,
    text,
    color
  };
}
</script>

<style scoped>
.records-dashboard {
  border-radius: 16px;
  overflow: hidden;
}

.dashboard-header {
  background: linear-gradient(135deg, #1a237e 0%, #3949ab 100%);
}

.control-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.search-field {
  min-width: 300px;
}

.filter-btn {
  height: 42px;
}

.export-btn {
  height: 42px;
}

.records-table {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.status-chip {
  min-width: 90px;
}

.edit-dialog {
  border-radius: 16px;
  overflow: hidden;
}

.confirm-dialog {
  border-radius: 12px;
  overflow: hidden;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .search-field {
    min-width: 100%;
  }
  
  .control-panel .d-flex {
    gap: 12px !important;
  }

  .filter-btn,
  .export-btn {
    width: 100%;
  }
}

/* Transitions */
.v-dialog-transition-enter-active,
.v-dialog-transition-leave-active {
  transition: opacity 0.3s ease;
}

.v-dialog-transition-enter-from,
.v-dialog-transition-leave-to {
  opacity: 0;
}
</style>