<template>
  <v-card>
  <v-container fluid class="form-container">
    <v-card class="form-wrapper">
      <v-card-title class="header">
        <v-icon size="32" class="mr-4">mdi-book-cross</v-icon>
        <h1>Cemetery Records Management</h1>
      </v-card-title>

      <v-card-text>
        <v-form v-model="isValid" @submit.prevent="createItem">
          <v-tabs
            v-model="activeTab"
            show-arrows
            slider-color="primary"
            align-tabs="center"
          >
            <v-tab value="personal">
              <v-icon start>mdi-account</v-icon>
              Personal Information
            </v-tab>
            <v-tab value="burial">
              <v-icon start>mdi-grave-stone</v-icon>
              Burial Details
            </v-tab>
            <v-tab value="contact">
              <v-icon start>mdi-card-account-details</v-icon>
              Contact Information
            </v-tab>
          </v-tabs>

          <v-window v-model="activeTab" class="mt-4">
            <!-- Personal Information Tab -->
            <v-window-item value="personal">
              <v-row>
                <v-col cols="12">
                  <div class="section-header">
                    <h2 class="section-title">Deceased Information</h2>
                    <span class="section-subtitle">Enter the personal details of the deceased</span>
                  </div>
                </v-col>

                <v-col v-for="field in deceasedFields" :key="field.model" cols="12" md="4">
                  <v-text-field
                    v-model="formData[field.model]"
                    :label="field.label"
                    :rules="field.rules"
                    :placeholder="field.placeholder"
                    :prepend-icon="field.icon"
                    :type="field.type"
                    variant="outlined"
                    hide-details="auto"
                    class="custom-field"
                    :error-messages="fieldErrors[field.model]"
                    @update:model-value="clearFieldError(field.model)"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-radio-group
                    v-model="formData.gender"
                    :rules="[v => !!v || 'Gender is required']"
                    class="custom-radio"
                  >
                    <template v-slot:label>
                      <div class="field-label">
                        <span class="label-text">Gender</span>
                        <span class="label-hint">Select the gender of the deceased</span>
                      </div>
                    </template>
                    <v-row>
                      <v-col cols="auto">
                        <v-radio label="Male" value="male" color="primary"/>
                      </v-col>
                      <v-col cols="auto">
                        <v-radio label="Female" value="female" color="primary"/>
                      </v-col>
                    </v-row>
                  </v-radio-group>
                </v-col>

                <v-col cols="12" md="6">
                  <v-radio-group
                    v-model="formData.indigent"
                    :rules="[v => !!v || 'Indigent status is required']"
                    class="custom-radio"
                  >
                    <template v-slot:label>
                      <div class="field-label">
                        <span class="label-text">Indigent Status</span>
                        <span class="label-hint">Indicate if the deceased is indigent</span>
                      </div>
                    </template>
                    <v-row>
                      <v-col cols="auto">
                        <v-radio label="Yes" value="yes" color="primary"/>
                      </v-col>
                      <v-col cols="auto">
                        <v-radio label="No" value="no" color="primary"/>
                      </v-col>
                    </v-row>
                  </v-radio-group>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Burial Details Tab -->
            <v-window-item value="burial">
              <v-row>
                <v-col cols="12">
                  <div class="section-header">
                    <h2 class="section-title">Burial Location & Details</h2>
                    <span class="section-subtitle">Specify the burial location and related information</span>
                  </div>
                </v-col>

                <v-col cols="12" md="4">
                  <v-select
                    v-model="formData.location"
                    :items="cemeteryOptions"
                    label="Cemetery Location"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    prepend-icon="mdi-map-marker"
                    class="custom-field"
                    :rules="[v => !!v || 'Cemetery location is required']"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-select
                    v-model="formData.graveyard_id"
                    :items="graveyardOptions"
                    label="Graveyard Section"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    prepend-icon="mdi-format-list-numbered"
                    class="custom-field"
                  />
                </v-col>

                <v-col v-for="field in burialFields" :key="field.model" cols="12" md="4">
                  <v-text-field
                    v-model="formData[field.model]"
                    :label="field.label"
                    :rules="field.rules"
                    :placeholder="field.placeholder"
                    :prepend-icon="field.icon"
                    :type="field.type"
                    variant="outlined"
                    class="custom-field"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-select
                    v-model="formData.apartment_stores"
                    :items="apartStoresTombOptions"
                    label="Apartment Store"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    prepend-icon="mdi-home"
                    class="custom-field"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-select
                    v-model="formData.ab_stores_tomb"
                    :items="abStoresTombOptions"
                    label="Apartment Baby Store"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    prepend-icon="mdi-home-variant"
                    class="custom-field"
                  />
                </v-col>

                <v-col cols="12" md="4">
                  <v-select
                    v-model="formData.bone_vault"
                    :items="boneVaultOptions"
                    label="Bone Vault"
                    item-title="title"
                    item-value="value"
                    variant="outlined"
                    prepend-icon="mdi-archive"
                    class="custom-field"
                  />
                </v-col>
              </v-row>
            </v-window-item>

            <!-- Contact Information Tab -->
            <v-window-item value="contact">
              <v-row>
                <v-col cols="12">
                  <div class="section-header">
                    <h2 class="section-title">Contact & Additional Details</h2>
                    <span class="section-subtitle">Enter contact information and other relevant details</span>
                  </div>
                </v-col>

                <v-col v-for="field in contactFields" :key="field.model" cols="12" md="4">
                  <v-text-field
                    v-model="formData[field.model]"
                    :label="field.label"
                    :rules="field.rules"
                    :placeholder="field.placeholder"
                    :prepend-icon="field.icon"
                    :type="field.type"
                    variant="outlined"
                    class="custom-field"
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-switch
                    v-model="formData.renew"
                    label="Renewal Status"
                    color="success"
                    class="custom-switch"
                    hide-details
                  />
                </v-col>

                <v-col cols="12" md="6">
                  <v-switch
                    v-model="formData.transfer"
                    label="Transfer Status"
                    color="info"
                    class="custom-switch"
                    hide-details
                  />
                </v-col>
              </v-row>
            </v-window-item>
          </v-window>

          <v-divider class="my-6"/>

          <div class="d-flex justify-space-between align-center">
            <v-btn 
              color="secondary" 
              variant="outlined"
              @click="resetForm"
            >
              <v-icon start>mdi-refresh</v-icon>
              Reset Form
            </v-btn>

            <div class="d-flex gap-4">
              <v-btn
                color="primary"
                :disabled="!isValid || isSubmitting"
                :loading="isSubmitting"
                @click="createItem"
              >
                <v-icon start>mdi-content-save</v-icon>
                Save Record
              </v-btn>
              <v-btn
                color="success"
                variant="outlined"
                :disabled="!isValid || isSubmitting"
                @click="saveAndAddNew"
              >
                <v-icon start>mdi-plus</v-icon>
                Save & Add New
              </v-btn>
            </div>
          </div>
        </v-form>
      </v-card-text>
    </v-card>

    <!-- Success/Error Snackbar -->
    <v-snackbar
      v-model="snackbar.show"
      :color="snackbar.color"
      :timeout="4000"
      location="top right"
    >
      {{ snackbar.message }}
      <template v-slot:actions>
        <v-btn
          color="white"
          variant="text"
          @click="snackbar.show = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Confirmation Dialog -->
    <v-dialog v-model="confirmDialog.show" max-width="500px">
      <v-card>
        <v-card-title class="headline">{{ confirmDialog.title }}</v-card-title>
        <v-card-text>{{ confirmDialog.message }}</v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="secondary" variant="text" @click="confirmDialog.show = false">Cancel</v-btn>
          <v-btn color="primary" @click="confirmDialogAction">Continue</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</v-card>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

// Constants
const API_URL = 'http://localhost:8055';
const ENDPOINTS = {
  burialRecords: `${API_URL}/items/burial_records`,
  cemeteries: `${API_URL}/items/cemeteries`,
  abStores: `${API_URL}/items/apartment_baby_stores`,
  boneVault: `${API_URL}/items/bone_vault_stores`,
  graveyard: `${API_URL}/items/graveyards`,
  apartmentStores: `${API_URL}/items/apartment_stores`
};


// Router setup
const router = useRouter();

// State management
const isValid = ref(false);
const isSubmitting = ref(false);
const activeTab = ref('personal');
const authToken = ref(localStorage.getItem('auth-token'));
const fieldErrors = ref({});

// Form data and options
const formData = ref({
  first_name: '',
  middle_name: '',
  last_name: '',
  age: '',
  gender: '',
  indigent: '',
  address: '',
  date_of_birth: '',
  date_of_death: '',
  date_of_expiration: '',
  date_of_renewal: '',
  ab_stores_tomb: '',
  bone_vault: '',
  graveyard_id: '',
  location: '',
  contact_person: '',
  new_user_of_burial: '',
  number_of_renew: '',
  or_number: '',
  removed: '',
  renew: false,
  transfer: false,
  year_covered: '',
  amount: '',
});

// UI state management
const snackbar = ref({
  show: false,
  message: '',
  color: 'success'
});

const confirmDialog = ref({
  show: false,
  title: '',
  message: '',
  action: null
});

// Field definitions
const deceasedFields = [
  { label: 'First Name', model: 'first_name', placeholder: 'Enter first name', icon: 'mdi-account', rules: [v => !!v || 'First name is required'] },
  { label: 'Middle Name', model: 'middle_name', placeholder: 'Enter middle name', icon: 'mdi-account' },
  { label: 'Last Name', model: 'last_name', placeholder: 'Enter last name', icon: 'mdi-account', rules: [v => !!v || 'Last name is required'] },
  { label: 'Age', model: 'age', placeholder: 'Enter age', icon: 'mdi-numeric', type: 'number', rules: [v => !!v || 'Age is required'] },
  { label: 'Date of Birth', model: 'date_of_birth', placeholder: 'Select date of birth', icon: 'mdi-calendar', type: 'date' },
  { label: 'Date of Death', model: 'date_of_death', placeholder: 'Select date of death', icon: 'mdi-calendar', type: 'date' },
];

const burialFields = [
  { label: 'Address', model: 'address', placeholder: 'Enter burial address', icon: 'mdi-map-marker' },
  { label: 'Amount', model: 'amount', placeholder: 'Enter amount', icon: 'mdi-currency-php', type: 'number' },
  { 
    label: 'Year Covered', 
    model: 'year_covered', 
    placeholder: 'Select year covered', 
    icon: 'mdi-calendar', 
    type: 'date' // Changed from 'number' to 'date'
  },
  { label: 'Date of Renewal', model: 'date_of_renewal', placeholder: 'Select renewal date', icon: 'mdi-calendar', type: 'date' },
];

const contactFields = [
  { label: 'Contact Person', model: 'contact_person', placeholder: 'Enter contact person name', icon: 'mdi-account-box', rules: [v => !!v || 'Contact person is required'] },
  { label: 'OR Number', model: 'or_number', placeholder: 'Enter OR number', icon: 'mdi-receipt', rules: [v => !!v || 'OR number is required'] },
  { label: 'Number of Renewals', model: 'number_of_renew', placeholder: 'Enter number of renewals', icon: 'mdi-refresh', type: 'number' },
  { label: 'New User of Burial', model: 'new_user_of_burial', placeholder: 'Enter new user name', icon: 'mdi-account-switch' },
  { label: 'Date of Expiration', model: 'date_of_expiration', placeholder: 'Select expiration date', icon: 'mdi-calendar', type: 'date' },
];

// Select options
const cemeteryOptions = ref([]);
const graveyardOptions = ref([]);
const apartStoresTombOptions = ref([]);
const abStoresTombOptions = ref([]);
const boneVaultOptions = ref([]);

const fetchAndFilterGraveyards = async () => {
  try {
    // Fetch all used graveyards from burial records
    const usedGraveyardsResponse = await axios.get(`${ENDPOINTS.burialRecords}?fields=graveyard_id`, {
      headers: {
        Authorization: `Bearer ${authToken.value}`,
        'Content-Type': 'application/json'
      }
    });

    // Extract used graveyard IDs
    const usedGraveyardIds = new Set(
      usedGraveyardsResponse.data.data
        .map(record => record.graveyard_id)
        .filter(id => id !== null)
    );

    // Filter out used graveyards from options
    graveyardOptions.value = graveyardOptions.value.filter(
      graveyard => !usedGraveyardIds.has(graveyard.value)
    );

  } catch (error) {
    console.error('Error fetching used graveyards:', error);
    showError('Failed to filter graveyard options');
  }
};

const fetchAndFilterApartmentStores = async () => {
  try {
    // Fetch all used apartment stores from burial records
    const usedApartmentStoresResponse = await axios.get(`${ENDPOINTS.burialRecords}?fields=ab_stores_tomb`, {
      headers: {
        Authorization: `Bearer ${authToken.value}`,
        'Content-Type': 'application/json'
      }
    });

    // Extract used apartment store IDs
    const usedApartmentStoreIds = new Set(
      usedApartmentStoresResponse.data.data
        .map(record => record.ab_stores_tomb)
        .filter(id => id !== null)
    );

    // Filter out used apartment stores from options
    apartStoresTombOptions.value = apartStoresTombOptions.value.filter(
      store => !usedApartmentStoreIds.has(store.value)
    );

  } catch (error) {
    console.error('Error fetching used apartment stores:', error);
    showError('Failed to filter apartment store options');
  }
};

const fetchAndFilterAbStores = async () => {
  try {
    // Fetch all used apartment baby stores from burial records
    const usedAbStoresResponse = await axios.get(`${ENDPOINTS.burialRecords}?fields=baby_apartment_stores`, {
      headers: {
        Authorization: `Bearer ${authToken.value}`,
        'Content-Type': 'application/json'
      }
    });

    // Extract used apartment baby store IDs
    const usedAbStoreIds = new Set(
      usedAbStoresResponse.data.data
        .map(record => record.baby_apartment_stores)
        .filter(id => id !== null)
    );

    // Filter out used apartment baby stores from options
    abStoresTombOptions.value = abStoresTombOptions.value.filter(
      store => !usedAbStoreIds.has(store.value)
    );

  } catch (error) {
    console.error('Error fetching used apartment baby stores:', error);
    showError('Failed to filter apartment baby store options');
  }
};

const fetchAndFilterBoneVaults = async () => {
  try {
    // Fetch all used bone vaults from burial records
    const usedBoneVaultsResponse = await axios.get(`${ENDPOINTS.burialRecords}?fields=bone_vault`, {
      headers: {
        Authorization: `Bearer ${authToken.value}`,
        'Content-Type': 'application/json'
      }
    });

    // Extract used bone vault IDs
    const usedBoneVaultIds = new Set(
      usedBoneVaultsResponse.data.data
        .map(record => record.bone_vault)
        .filter(id => id !== null)
    );

    // Filter out used bone vaults from options
    boneVaultOptions.value = boneVaultOptions.value.filter(
      vault => !usedBoneVaultIds.has(vault.value)
    );

  } catch (error) {
    console.error('Error fetching used bone vaults:', error);
    showError('Failed to filter bone vault options');
  }
};


// Fetch data on component mount
onMounted(async () => {
  if (!authToken.value) {
    console.log('No authentication token found. Redirecting to login page...');
    router.push('/login');
    return;
  }
  console.log('Authenticated with token:', authToken.value);

  const headers = {
    Authorization: `Bearer ${authToken.value}`,
    'Content-Type': 'application/json'
  };
  try {
    // Fetch all data in parallel using Promise.all
    const [
      cemeteryResponse,
      graveyardResponse,
      apartStoresResponse,
      abStoresResponse,
      boneVaultResponse
    ] = await Promise.all([
      axios.get(ENDPOINTS.cemeteries, { headers }),
      axios.get(ENDPOINTS.graveyard, { headers }),
      axios.get(ENDPOINTS.apartmentStores, { headers }),
      axios.get(ENDPOINTS.abStores, { headers }),
      axios.get(ENDPOINTS.boneVault, { headers })
    ]);

    // Map cemetery data
    cemeteryOptions.value = cemeteryResponse.data.data.map(cemetery => ({
      title: cemetery.cemetery_name || cemetery.id,
      value: cemetery.id,
      ...cemetery
    }));

    // Map graveyard data
    graveyardOptions.value = graveyardResponse.data.data.map(graveyard => ({
      title: graveyard.graveyard_name || graveyard.id,
      value: graveyard.id,
      ...graveyard
    }));

    // Map apartment stores data
    apartStoresTombOptions.value = apartStoresResponse.data.data.map(store => ({
      title: store.ab_store_name || store.id,
      value: store.id,
      ...store
    }));

    // Map apartment baby stores data
    abStoresTombOptions.value = abStoresResponse.data.data.map(store => ({
      title: store.apartment_baby_id || store.id,
      value: store.id,
      ...store
    }));

    // Map bone vault data
    boneVaultOptions.value = boneVaultResponse.data.data.map(vault => ({
      title: vault.bone_vault_id || vault.id,
      value: vault.id,
      ...vault
    }));


      // Call the new function to filter out used graveyards
      await fetchAndFilterGraveyards();
      await fetchAndFilterApartmentStores();
      await fetchAndFilterAbStores();
      await fetchAndFilterBoneVaults();

  } catch (error) {
    console.error('Error fetching options:', error);
    showError(error.response?.data?.message || 'Failed to load form options');
    
    // Log detailed error information
    if (error.response) {
      console.error('Error response:', {
        status: error.response.status,
        data: error.response.data
      });
    }
  }
});

// Update the utility function for mapping select options
const mapToSelectOptions = (data, titleKey = 'name') => {
  return data.map(item => ({
    title: item[titleKey] || item.title || item.id,
    value: item.id,
    ...item // Preserve all original data
  }));
};

const clearFieldError = (fieldName) => {
  if (fieldErrors.value[fieldName]) {
    fieldErrors.value[fieldName] = null;
  }
};

const showSuccess = (message) => {
  snackbar.value = {
    show: true,
    message,
    color: 'success'
  };
};

const showError = (message) => {
  snackbar.value = {
    show: true,
    message,
    color: 'error'
  };
};

const confirmAction = (title, message, action) => {
  confirmDialog.value = {
    show: true,
    title,
    message,
    action
  };
};

const confirmDialogAction = () => {
  if (confirmDialog.value.action) {
    confirmDialog.value.action();
  }
  confirmDialog.value.show = false;
};

// Form actions
const resetForm = () => {
  confirmAction(
    'Reset Form',
    'Are you sure you want to reset the form? All entered data will be lost.',
    () => {
      Object.keys(formData.value).forEach(key => {
        if (typeof formData.value[key] === 'boolean') {
          formData.value[key] = false;
        } else {
          formData.value[key] = '';
        }
      });
      activeTab.value = 'personal';
      fieldErrors.value = {};
    }
  );
};

// Update the createItem function
const createItem = async () => {
  if (!validateForm()) {
    showError('Please fill in all required fields');
    return;
  }

  isSubmitting.value = true;

  // Format dates properly for Directus
  const formattedData = {
    ...formData.value,
    date_of_birth: formData.value.date_of_birth ? new Date(formData.value.date_of_birth).toISOString().split('T')[0] : null,
    date_of_death: formData.value.date_of_death ? new Date(formData.value.date_of_death).toISOString().split('T')[0] : null,
    date_of_renewal: formData.value.date_of_renewal ? new Date(formData.value.date_of_renewal).toISOString().split('T')[0] : null,
    date_of_expiration: formData.value.date_of_expiration ? new Date(formData.value.date_of_expiration).toISOString().split('T')[0] : null,
    year_covered: formData.value.year_covered ? new Date(formData.value.year_covered).toISOString().split('T')[0] : null,
  };

  // Convert empty strings to null
  Object.keys(formattedData).forEach(key => {
    if (formattedData[key] === '') {
      formattedData[key] = null;
    }
  });

  // Convert numeric strings to numbers
  const numericFields = ['age', 'amount',  'number_of_renew'];
  numericFields.forEach(field => {
    if (formattedData[field]) {
      formattedData[field] = Number(formattedData[field]);
    }
  });

  try {
    const response = await axios.post(
      ENDPOINTS.burialRecords,
      formattedData,
      {
        headers: {
          'Authorization': `Bearer ${authToken.value}`,
          'Content-Type': 'application/json'
        }
      }
    );

    showSuccess('Record created successfully');
    return response.data;
  } catch (error) {
    console.error('Error creating record:', error);
    
    if (error.response?.data?.errors) {
      // Clear previous errors
      fieldErrors.value = {};
      
      // Map API validation errors to fields
      error.response.data.errors.forEach(err => {
        fieldErrors.value[err.field] = err.message;
      });
      
      // Show the first error message
      showError(error.response.data.errors[0]?.message || 'Validation error');
    } else {
      showError(error.response?.data?.message || 'Failed to create record');
    }
    throw error;
  } finally {
    isSubmitting.value = false;
  }
};

// Update the saveAndAddNew function
const saveAndAddNew = async () => {
  try {
    await createItem();
    // Only reset if save was successful
    Object.keys(formData.value).forEach(key => {
      if (typeof formData.value[key] === 'boolean') {
        formData.value[key] = false;
      } else {
        formData.value[key] = '';
      }
    });
    activeTab.value = 'personal';
    fieldErrors.value = {};
    showSuccess('Record created successfully. Form reset for new entry.');
  } catch (error) {
    // Error already handled in createItem
  }
};

// Add a proper validation function
const validateForm = () => {
  // Required fields
  const requiredFields = [
    'first_name',
    'last_name',
    'age',
    'gender',
    'indigent',
    'contact_person',
    'or_number'
  ];

  // Clear previous errors
  fieldErrors.value = {};

  // Check required fields
  let isValid = true;
  requiredFields.forEach(field => {
    if (!formData.value[field]) {
      fieldErrors.value[field] = `${field.replace('_', ' ').toUpperCase()} is required`;
      isValid = false;
    }
  });

  // Validate age
  if (formData.value.age && (isNaN(formData.value.age) || formData.value.age < 0)) {
    fieldErrors.value.age = 'Age must be a valid number';
    isValid = false;
  }

  // Validate dates
  const dateFields = ['date_of_birth', 'date_of_death', 'date_of_renewal', 'date_of_expiration', 'year_covered'];
  dateFields.forEach(field => {
    if (formData.value[field] && !isValidDate(formData.value[field])) {
      fieldErrors.value[field] = 'Please enter a valid date';
      isValid = false;
    }
  });

  return isValid;
};

// Add a date validation helper
const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};
</script>

<style>
.form-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;

}

.form-wrapper {
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header {
  padding: 1.5rem;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  align-items: center;
}

.header h1 {
  font-size: 1.5rem;
  margin: 0;
  color: #2c3e50;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.25rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.section-subtitle {
  font-size: 0.875rem;
  color: #6c757d;
}

.custom-field {
  margin-bottom: 1rem;
}

.custom-radio {
  margin-top: 0.5rem;
}

.field-label {
  display: flex;
  flex-direction: column;
}

.label-text {
  font-weight: 500;
  color: #2c3e50;
}

.label-hint {
  font-size: 0.75rem;
  color: #6c757d;
}

.custom-switch {
  margin-top: 1rem;
}

/* Responsive adjustments */
@media (max-width: 960px) {
  .form-container {
    padding: 1rem;
  }

  .header {
    padding: 1rem;
  }

  .header h1 {
    font-size: 1.25rem;
  }
}
</style>