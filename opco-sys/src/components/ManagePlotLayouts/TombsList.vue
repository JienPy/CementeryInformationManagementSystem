<template>
  <v-card class="tomb-management">
    <v-container fluid>
      <!-- Header Section -->
      <v-row class="header-section mb-6">
        <v-col cols="12" md="8">
          <h1 class="text-h4 font-weight-bold primary--text">
            {{ selectedCollectionTitle }}
            <span class="text-subtitle-1 text-medium-emphasis">Management Dashboard</span>
          </h1>
        </v-col>
        <v-col cols="12" md="4">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Search records..."
            variant="outlined"
            density="compact"
            hide-details
            class="search-field"
          />
        </v-col>
      </v-row>

      <!-- Collection Navigation -->
      <v-row class="collection-navigation mb-6">
        <v-col cols="12">
          <v-card flat class="pa-4 rounded-lg">
            <v-row align="center" justify="space-between">
              <v-col v-for="collection in collections" :key="collection.value" cols="auto">
                <v-btn
                  :color="selectedCollection === collection.value ? 'primary' : ''"
                  :variant="selectedCollection === collection.value ? 'elevated' : 'outlined'"
                  class="collection-btn"
                  @click="selectCollection(collection.value)"
                >
                  <v-icon :icon="getCollectionIcon(collection.value)" class="mr-2" />
                  {{ collection.label }}
                </v-btn>
                <v-btn
                  icon="mdi-map-marker"
                  variant="text"
                  size="small"
                  class="ml-2"
                  @click.stop="openMap(collection.value)"
                />
              </v-col>
            </v-row>
          </v-card>
        </v-col>
      </v-row>

      <!-- Data Table -->
      <v-card flat class="data-table-container">
        <v-data-table
          :headers="getHeaders"
          :items="tombs"
          :search="search"
          :loading="isLoading"
          hover
        >
          <template v-slot:item.status="{ item }">
            <v-chip
              :color="getStatusChipColor(item.status)"
              size="small"
              class="text-capitalize"
            >
              {{ item.status }}
            </v-chip>
          </template>
          
          <template v-slot:item.action="{ item }">
            <v-btn
              icon="mdi-pencil"
              variant="text"
              size="small"
              color="primary"
              class="mr-2"
              @click="editItem(item)"
            />
            <!-- <v-btn
              icon="mdi-delete"
              variant="text"
              size="small"
              color="error"
              @click="confirmDelete(item)"
            /> -->
          </template>
        </v-data-table>
      </v-card>

      <!-- Add this inside your template, at the same level as other dialogs -->
      <v-dialog v-model="editDialog" max-width="500px">
        <v-card>
          <v-card-title class="text-h5 bg-primary text-black pa-4">
            {{ formTitle }}
          </v-card-title>

          <v-card-text class="pa-4">
            <v-container>
              <v-row>
                <v-col cols="12" v-for="field in editedFields" :key="field">
                  <!-- Updated Status Select Field -->
                  <v-select
                    v-if="field === 'status'"
                    v-model="editedItem[field]"
                    :items="statusOptionsFormatted"
                    :label="formatFieldName(field)"
                    required
                    :rules="[v => !!v || 'Status is required']"
                    variant="outlined"
                    density="comfortable"
                    item-title="text"
                    item-value="value"
                    return-object
                  >
                    <template v-slot:selection="{ item }">
                      <v-chip
                        :color="getStatusChipColor(item.value)"
                        size="small"
                        class="mr-2"
                      >
                        {{ item.text }}
                      </v-chip>
                    </template>
                    <template v-slot:item="{ item, props }">
                      <v-list-item v-bind="props">
                        <template v-slot:prepend>
                          <v-chip
                            :color="getStatusChipColor(item.value)"
                            size="small"
                            class="mr-2"
                          />
                        </template>
                        <v-list-item-title>{{ item.text }}</v-list-item-title>
                      </v-list-item>
                    </template>
                  </v-select>


                  <!-- Notes Text Area -->
                  <v-textarea
                    v-else-if="field === 'notes'"
                    v-model="editedItem[field]"
                    :label="formatFieldName(field)"
                    variant="outlined"
                    density="comfortable"
                    auto-grow
                    rows="3"
                  />

                  <!-- Default Text Field for other fields -->
                  <v-text-field
                    v-else
                    v-model="editedItem[field]"
                    :label="formatFieldName(field)"
                    required
                    :rules="[v => !!v || `${formatFieldName(field)} is required`]"
                    variant="outlined"
                    density="comfortable"
                  />
                </v-col>
              </v-row>
            </v-container>
          </v-card-text>

          <v-card-actions class="pa-4">
            <v-spacer />
            <v-btn
              color="primary"
              variant="elevated"
              :disabled="!validateForm"
              @click="saveItem"
            >
              Save
            </v-btn>
            <v-btn
              color="grey"
              variant="text"
              @click="closeEdit"
            >
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Enhanced Map Dialog -->
      <v-dialog v-model="dialog" fullscreen transition="dialog-bottom-transition">
        <v-card>
          <v-toolbar color="primary" prominent>
            <v-btn icon="mdi-close" @click="dialog = false" />
            <v-toolbar-title class="text-h6 font-weight-bold">
              {{ selectedCollectionTitle }} Map View
            </v-toolbar-title>
            <v-spacer />
            <v-btn icon="mdi-refresh" @click="refreshMapData" />
          </v-toolbar>

          <v-container fluid class="map-container pa-6">
            <v-row>
              <!-- Map Statistics -->
              <v-col cols="12" md="3">
                <v-card class="stats-card mb-4">
                  <v-card-text>
                    <div class="text-h6 mb-2">Statistics</div>
                    <v-list density="compact">
                      <v-list-item>
                        <template v-slot:prepend>
                          <v-icon color="primary">mdi-database</v-icon>
                        </template>
                        <v-list-item-title>Total Units</v-list-item-title>
                        <v-list-item-subtitle>{{ tombs.length }}</v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item>
                        <template v-slot:prepend>
                          <v-icon color="success">mdi-check-circle</v-icon>
                        </template>
                        <v-list-item-title>Available</v-list-item-title>
                        <v-list-item-subtitle>
                          {{ getStatusCount('available') }}
                        </v-list-item-subtitle>
                      </v-list-item>
                      <v-list-item>
                        <template v-slot:prepend>
                          <v-icon color="warning">mdi-alert</v-icon>
                        </template>
                        <v-list-item-title>Needs Attention</v-list-item-title>
                        <v-list-item-subtitle>
                          {{ getNeedsAttentionCount() }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-card-text>
                </v-card>

                <!-- Status Legend -->
                <v-card class="legend-card">
                  <v-card-text>
                    <div class="text-h6 mb-2">Status Legend</div>
                    <div class="legend-grid">
                      <div
                        v-for="status in statusLegend"
                        :key="status.label"
                        class="legend-item"
                      >
                        <div
                          class="legend-color"
                          :style="{ backgroundColor: status.color }"
                        />
                        <span class="legend-label">{{ status.label }}</span>
                      </div>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>

              <!-- Interactive Map -->
              <v-col cols="12" md="9">
                <v-card class="map-view-card">
                  <v-card-text>
                    <div class="map-grid">
                      <v-hover
                        v-for="tomb in currentTombs"
                        :key="tomb.id"
                        v-slot="{ isHovering, props }"
                      >
                        <div
                          v-bind="props"
                          class="tomb-cell"
                          :class="{ 'elevation-4': isHovering }"
                          :style="{
                            backgroundColor: getStatusColor(tomb.status),
                            transform: isHovering ? 'scale(1.1)' : 'scale(1)'
                          }"
                          @click="showTombDetails(tomb)"
                        >
                        <div class="tomb-label">
                          <!-- Display identifier based on tomb type -->
                          <span class="tomb-id">
                            {{ getTombShortId(tomb) }}
                          </span>
                          <span class="tomb-type-icon">
                            {{ getTombTypeIcon(tomb) }}
                          </span>
                        </div>
                        <v-tooltip 
                            activator="parent" 
                            location="top"
                            :html="true"
                          >
                            
                            <div class="pa-2">
                              <div class="text-subtitle-2 font-weight-bold">
                               Tomb ID: {{ getTombIdentifier(tomb) }}
                              </div>
                               Occupied Name: {{ getTombTooltipContent(tomb) }}
                              <div class="text-caption">Status: {{ tomb.status }}</div>
                            </div>
                          </v-tooltip>
                        </div>
                      </v-hover>
                    </div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>
          </v-container>
        </v-card>
      </v-dialog>

      <!-- Tomb Details Dialog -->
      <v-dialog v-model="detailsDialog" max-width="500px">
        <v-card v-if="selectedTomb">
          <v-card-title class="text-h5 bg-primary text-white pa-4">
            {{ getTombIdentifier(selectedTomb) }}
          </v-card-title>
          <v-card-text class="pa-4">
            <v-list density="compact">
              <v-list-item>
                <template v-slot:prepend>
                  <v-icon color="primary">mdi-account</v-icon>
                </template>
                <v-list-item-title>Name</v-list-item-title>
                <v-list-item-subtitle>
                  {{ getTombTooltipContent(selectedTomb) }}
                </v-list-item-subtitle>
              </v-list-item>
              <v-list-item v-for="(value, key) in getTombDetails(selectedTomb)" :key="key">
                <template v-slot:prepend>
                  <v-icon color="primary">{{ getFieldIcon(key) }}</v-icon>
                </template>
                <v-list-item-title>{{ formatFieldName(key) }}</v-list-item-title>
                <v-list-item-subtitle>{{ value }}</v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" variant="text" @click="editItem(selectedTomb)">
              Edit
            </v-btn>
            <v-btn color="grey" variant="text" @click="detailsDialog = false">
              Close
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <!-- Delete Confirmation Dialog -->
      <v-dialog v-model="deleteDialog" max-width="400px">
        <v-card>
          <v-card-title class="text-h5 bg-error text-white pa-4">
            Confirm Deletion
          </v-card-title>
          <v-card-text class="pa-4">
            Are you sure you want to delete this item? This action cannot be undone.
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="error" variant="text" @click="deleteItem">
              Delete
            </v-btn>
            <v-btn color="grey" variant="text" @click="deleteDialog = false">
              Cancel
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-card>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import axios from 'axios';

const apiUrl = 'http://localhost:8055';
const search = ref('');
const selectedCollection = ref('graveyards');
const isLoading = ref(true);
const dialog = ref(false);
const editDialog = ref(false);  
const selectedMapCollection = ref('');
const tombs = ref([]);

const collections = [
  { label: 'Graveyards', value: 'graveyards' },
  { label: 'Apartment Stores', value: 'apartment_stores' },
  { label: 'Bone Vault Stores', value: 'bone_vault_stores' },
  { label: 'Apartment Baby Stores', value: 'apartment_baby_stores' },
];

const editedItem = ref({});
const defaultItem = ref({
  tomb_number: '',
  status: 'available',
  graveyard_name: '',
  apartment_block_type: '',
  bone_vault_number: '',
  apartment_baby_number: '',
  notes: ''
});

const selectedCollectionTitle = computed(() => {
  return collections.find(c => c.value === selectedCollection.value).label;
});
// Add new methods for tomb labels
const getTombShortId = (tomb) => {
  if (tomb.tomb_number) return `G${tomb.tomb_number}`;
  if (tomb.ab_store_name) return `A${tomb.id}`;
  if (tomb.bone_vault_number) return `V${tomb.bone_vault_number}`;
  if (tomb.apartment_baby_number) return `B${tomb.apartment_baby_number}`;
  return tomb.id;
};

const getTombTypeIcon = (tomb) => {
  if (tomb.graveyard_name) return '⚰️';
  if (tomb.ab_store_name) return '🏢';
  if (tomb.bone_vault_number) return '📦';
  if (tomb.apartment_baby_number) return '👶';
  return '📍';
};

const getHeaders = computed(() => {
  return headers[selectedCollection.value];
});

const headers = {
  graveyards: [
    { title: 'Graveyard Name', key: 'graveyard_name', sortable: true },
    { title: 'Tomb Number', key: 'tomb_number', sortable: true },
    { title: 'Status', key: 'status', sortable: true },
    { title: 'Actions', key: 'action', sortable: false },
  ],
  apartment_stores: [
    { title: 'Apartment Store Name', key: 'ab_store_name', sortable: true },
    { title: 'Apartment Block Type', key: 'apartment_block_type', sortable: true },
    { title: 'Status', key: 'status', sortable: true },
    { title: 'Actions', key: 'action', sortable: false },
  ],
  bone_vault_stores: [
    { title: 'Bone Vault ID', key: 'bone_vault_id', sortable: true },
    { title: 'Bone Vault Number', key: 'bone_vault_number', sortable: true },
    { title: 'Status', key: 'status', sortable: true },
    { title: 'Actions', key: 'action', sortable: false },
  ],
  apartment_baby_stores: [
    { title: 'Apartment Baby ID', key: 'apartment_baby_id', sortable: true },
    { title: 'Apartment Baby Number', key: 'apartment_baby_number', sortable: true },
    { title: 'Status', key: 'status', sortable: true },
    { title: 'Actions', key: 'action', sortable: false },
  ],
};

const rules = {
  required: value => !!value || 'Required.',
};

// Status options for the select field
const statusOptionsFormatted = computed(() => [
  { value: 'available', text: 'Available', group: 'Primary' },
  { value: 'active', text: 'Active', group: 'Primary' },
  { value: 'inactive', text: 'Inactive', group: 'Primary' },
  { value: 'recently_occupied', text: 'Recently Occupied', group: 'Occupancy' },
  { value: 'long_term_occupied', text: 'Long Term Occupied', group: 'Occupancy' },
  { value: 'expired', text: 'Expired', group: 'Attention Required' },
  { value: 'pending_renewal', text: 'Pending Renewal', group: 'Attention Required' },
  { value: 'abandoned', text: 'Abandoned', group: 'Attention Required' },
  { value: 'in_dispute', text: 'In Dispute', group: 'Attention Required' },
  { value: 'well_maintained', text: 'Well Maintained', group: 'Maintenance' },
  { value: 'needs_maintenance', text: 'Needs Maintenance', group: 'Maintenance' },
  { value: 'requires_major_repairs', text: 'Requires Major Repairs', group: 'Maintenance' }
]);

// Add these computed properties
const formTitle = computed(() => {
  return editedItem.value.id ? 'Edit Item' : 'New Item';
});

const editedFields = computed(() => {
  // Return relevant fields based on the selected collection
  const commonFields = ['status', 'notes'];
  const collectionFields = {
    graveyards: ['tomb_number', 'graveyard_name'],
    apartment_stores: ['apartment_block_type'],
    bone_vault_stores: ['bone_vault_number'],
    apartment_baby_stores: ['apartment_baby_number']
  };
  
  return [...commonFields, ...(collectionFields[selectedCollection.value] || [])];
});



const getStatusColor = (status) => {
  const statusColors = {
    active: '#008000',
    inactive : '#D3D3D3',
    available: '#00BFFF',
    recently_occupied: '#BA55D3',
    long_term_occupied: '#4169E1',
    expired: '#DC143C',
    pending_renewal: '#FFD700',
    abandoned: '#A52A2A',
    in_dispute: '#FFFF00',
    well_maintained: '#228B22',
    needs_maintenance: '#FFA500',
    requires_major_repairs: '#8B0000',
  };
  return statusColors[status] || '#ffffff';
};

const statusLegend = [
  { label: 'Active', color: '#008000' },
  { label: 'Inactive', color: '#D3D3D3' },
  { label: 'Available', color: '#00BFFF' },
  { label: 'Recently Occupied', color: '#BA55D3' },
  { label: 'Long-Term Occupied', color: '#4169E1' },
  { label: 'Expired', color: '#DC143C' },
  { label: 'Pending Renewal', color: '#FFD700' },
  { label: 'Abandoned', color: '#A52A2A' },
  { label: 'In Dispute', color: '#FFFF00' },
  { label: 'Well Maintained', color: '#228B22' },
  { label: 'Needs Maintenance', color: '#FFA500' },
  { label: 'Requires Major Repairs', color: '#8B0000' },
];
const fetchBurialRecordsForTomb = async (tomb) => {
  try {
    let burialEndpoint = '';
    let matchField = '';

    // Determine the correct endpoint and matching field based on collection
    switch (selectedCollection.value) {
      case 'graveyards':
        burialEndpoint = 'burial_records';
        matchField = 'graveyard_id';
        break;
      case 'bone_vault_stores':
        burialEndpoint = 'burial_records';
        matchField = 'bone_vault';
        break;
      case 'apartment_stores':
        burialEndpoint = 'burial_records';
        matchField = 'ab_stores_tomb';
        break;
      case 'apartment_baby_stores':
        burialEndpoint = 'burial_records';
        matchField = 'baby_apartment_stores';
        break;
      default:
        return null;
    }

    // Construct query parameters
    const params = {
      filter: {
        [matchField]: {
          _eq: tomb.id
        }
      },
      fields: ['first_name', 'middle_name', 'last_name']
    };

    const response = await axios.get(`${apiUrl}/items/${burialEndpoint}`, { params });
    
    return response.data.data.length > 0 ? response.data.data[0] : null;
  } catch (error) {
    console.error('Error fetching burial records:', error);
    return null;
  }
};

// Modify the tombs ref to include burial record information
const tombsWithBurialInfo = ref([]);


// Update fetchData to include burial record fetching
const fetchData = async (newCollection) => {
  isLoading.value = true;

  const collectionData = collections.find(c => c.value === newCollection);
  if (!collectionData) {
    console.error(`No data found for collection: ${newCollection}`);
    isLoading.value = false;
    return;
  }

  const response = await axios.get(`${apiUrl}/items/${newCollection}`);
  const baseTombs = response.data.data;

  // Fetch burial records for each tomb
  const tombsWithBurial = await Promise.all(
    baseTombs.map(async (tomb) => {
      const burialRecord = await fetchBurialRecordsForTomb(tomb);
      return {
        ...tomb,
        burialRecord: burialRecord
      };
    })
  );

  tombsWithBurialInfo.value = tombsWithBurial;
  tombs.value = tombsWithBurial;

  isLoading.value = false;
};

// Modified tooltip generation to include burial record name
const getTombTooltipContent = (tomb) => {
  // Function to properly capitalize a name
  const capitalizeName = (name) => {
    if (!name) return '';
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  // Generate name from burial record if available
  let nameContent = 'Unoccupied';
  if (tomb.burialRecord) {
    const { first_name, middle_name, last_name } = tomb.burialRecord;
    
    // Capitalize and handle null/undefined values
    const formattedFirstName = capitalizeName(first_name);
    const formattedMiddleName = middle_name ? ` ${capitalizeName(middle_name)}` : '';
    const formattedLastName = last_name ? ` ${capitalizeName(last_name)}` : '';
    
    const fullName = `${formattedFirstName}${formattedMiddleName}${formattedLastName}`.trim();
    
    nameContent = fullName || 'Unoccupied';
  }

  return nameContent;
};
// Updated function to work with any collection
const updateInactiveTombs = async (collection) => {
  try {
    const response = await axios.get(`${apiUrl}/items/${collection}`);
    const allItems = response.data.data;

    // Filter items that have no status
    const itemsToUpdate = allItems.filter(item => !item.status);

    // Update each item to set status to 'inactive'
    for (const item of itemsToUpdate) {
      await axios.patch(`${apiUrl}/items/${collection}/${item.id}`, {
        status: 'inactive'
      });
    }

    // Fetch updated data after patching
    await fetchData(collection);
  } catch (error) {
    console.error(`Error updating inactive items in ${collection}:`, error);
  }
};

onMounted(async () => {
  await fetchData(selectedCollection.value);
  await updateInactiveTombs(selectedCollection.value); // Call the function to update tomb statuses
  watch(selectedCollection, async (newCollection) => {
    await fetchData(newCollection);
    await updateInactiveTombs(newCollection); // Update inactive items when collection changes
  });
});

const openMap = async (collection) => {
  await selectCollection(collection);
  selectedMapCollection.value = collection;
  dialog.value = true;
};


const selectCollection = async (collection) => {
  selectedCollection.value = collection;
  await fetchData(collection);
};

// Add these methods
// Update the editItem method to handle the new status format
const editItem = (item) => {
  const itemCopy = { ...item };
  // Convert status to formatted object if it's a string
  if (typeof itemCopy.status === 'string') {
    itemCopy.status = statusOptionsFormatted.value.find(
      option => option.value === itemCopy.status
    ) || statusOptionsFormatted.value[0];
  }
  editedItem.value = itemCopy;
  editDialog.value = true;
  if (detailsDialog.value) detailsDialog.value = false;
};

// New reactive references
const detailsDialog = ref(false);
const deleteDialog = ref(false);
const selectedTomb = ref(null);
const itemToDelete = ref(null);

// Collection icons mapping
const collectionIcons = {
  graveyards: 'mdi-grave-stone',
  apartment_stores: 'mdi-office-building',
  bone_vault_stores: 'mdi-archive',
  apartment_baby_stores: 'mdi-baby-carriage'
};

// Enhanced status color getters
const getStatusChipColor = (status) => {
  const statusColors = {
    active: 'success',
    inactive: 'grey',
    available: 'info',
    recently_occupied: 'purple',
    long_term_occupied: 'blue',
    expired: 'error',
    pending_renewal: 'warning',
    abandoned: 'brown',
    in_dispute: 'amber',
    well_maintained: 'green',
    needs_maintenance: 'orange',
    requires_major_repairs: 'deep-orange'
  };
  return statusColors[status] || 'grey';
};

// Utility functions
const getCollectionIcon = (collection) => {
  return collectionIcons[collection] || 'mdi-folder';
};

const getFieldIcon = (field) => {
  const fieldIcons = {
    status: 'mdi-information',
    tomb_number: 'mdi-pound',
    graveyard_name: 'mdi-grave-stone',
    apartment_block_type: 'mdi-office-building',
    bone_vault_number: 'mdi-archive',
    apartment_baby_number: 'mdi-baby-carriage'
  };
  return fieldIcons[field] || 'mdi-text';
};

const formatFieldName = (field) => {
  return field
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const getTombIdentifier = (tomb) => {
  if (tomb.graveyard_name) return `${tomb.graveyard_name} - ${tomb.tomb_number}`;
  if (tomb.ab_store_name) return tomb.ab_store_name;
  if (tomb.bone_vault_id) return `Vault ${tomb.bone_vault_id}`;
  if (tomb.apartment_baby_id) return `Unit ${tomb.apartment_baby_id}`;
  return 'Unknown';
};

const getTombDetails = (tomb) => {
  const excludeFields = ['id', 'created_at', 'updated_at', 'burialRecord'];
  return Object.fromEntries(
    Object.entries(tomb).filter(([key]) => !excludeFields.includes(key))
  );
};

const getStatusCount = (status) => {
  return tombs.value.filter(tomb => tomb.status === status).length;
};

const getNeedsAttentionCount = () => {
  const attentionStatuses = ['needs_maintenance', 'requires_major_repairs', 'expired', 'in_dispute'];
  return tombs.value.filter(tomb => attentionStatuses.includes(tomb.status)).length;
};

// Enhanced event handlers
const showTombDetails = (tomb) => {
  selectedTomb.value = tomb;
  detailsDialog.value = true;
};

const confirmDelete = (item) => {
  itemToDelete.value = item;
  deleteDialog.value = true;
};

const deleteItem = async () => {
  if (!itemToDelete.value) return;
  
  try {
    await axios.delete(`${apiUrl}/items/${selectedCollection.value}/${itemToDelete.value.id}`);
    await fetchData(selectedCollection.value);
    deleteDialog.value = false;
    itemToDelete.value = null;
  } catch (error) {
    console.error('Error deleting item:', error);
  }
};

const refreshMapData = async () => {
  await fetchData(selectedCollection.value);
};

const closeEdit = () => {
  editDialog.value = false;
  editedItem.value = Object.assign({}, defaultItem.value);
};

const saveItem = async () => {
  try {
    const saveData = { ...editedItem.value };
    // Convert status back to string value before saving
    if (saveData.status && typeof saveData.status === 'object') {
      saveData.status = saveData.status.value;
    }

    if (editedItem.value.id) {
      await axios.patch(
        `${apiUrl}/items/${selectedCollection.value}/${editedItem.value.id}`,
        saveData
      );
    } else {
      await axios.post(
        `${apiUrl}/items/${selectedCollection.value}`,
        saveData
      );
    }
    
    await fetchData(selectedCollection.value);
    closeEdit();
  } catch (error) {
    console.error('Error saving item:', error);
  }
};


// Add validation
const validateForm = computed(() => {
  const requiredFields = editedFields.value.filter(field => 
    !['notes'].includes(field)  // exclude optional fields
  );
  
  return requiredFields.every(field => 
    editedItem.value[field] && editedItem.value[field].toString().trim() !== ''
  );
});
const currentTombs = computed(() => tombs.value);

onMounted(async () => {
  await fetchData(selectedCollection.value);
  watch(selectedCollection, fetchData);
});  





</script>

<style scoped>

.tomb-cell {
  aspect-ratio: 1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border: 2px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  padding: 4px;
}

.tomb-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  text-align: center;
  color: rgba(0, 0, 0, 0.87);
  font-size: 0.875rem;
  line-height: 1.2;
  z-index: 1;
}

.tomb-id {
  font-weight: bold;
  font-size: 0.75rem;
  margin-bottom: 2px;
  color: rgba(0, 0, 0, 0.87);
  text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.5);
}

.tomb-type-icon {
  font-size: 1.2rem;
}

/* Adjust for dark backgrounds */
.tomb-cell[style*="background-color: rgb(139, 0, 0)"] .tomb-label,
.tomb-cell[style*="background-color: rgb(0, 128, 0)"] .tomb-label,
.tomb-cell[style*="background-color: rgb(65, 105, 225)"] .tomb-label {
  color: white;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.5);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .tomb-id {
    font-size: 0.7rem;
  }
  
  .tomb-type-icon {
    font-size: 1rem;
  }
}
.tomb-tooltip {
  padding: 8px;
  text-align: left;
  max-width: 250px;
}

.tomb-identifier {
  font-weight: bold;
  font-size: 0.95rem;
  margin-bottom: 4px;
  color: #333;
}

.tomb-status {
  font-size: 0.8rem;
  color: #666;
  margin-bottom: 4px;
}

.tomb-name {
  font-size: 0.9rem;
  color: #444;
  font-style: italic;
}
/* Add new styles for the status select */
:deep(.v-select) {
  .v-chip {
    margin-right: 8px;
  }
  
  .v-list-item {
    padding: 8px 16px;
  }
  
  .v-list-item__prepend {
    margin-right: 12px;
  }
}
.tomb-management {
  background-color: #f5f5f5;
  min-height: 100vh;
}

.header-section {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
}

.collection-navigation {
  margin-bottom: 24px;
}

.collection-btn {
  min-width: 150px;
  transition: all 0.3s ease;
}

.data-table-container {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
}

.map-container {
  background-color: #f5f5f5;
  height: calc(100vh - 64px);
  overflow-y: auto;
}

.stats-card, .legend-card {
  background-color: white;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.stats-card:hover, .legend-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 25px 0 rgba(0, 0, 0, 0.1);
}

.legend-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 4px;
}

.legend-label {
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.87);
}

.map-view-card {
  height: calc(100vh - 200px);
  overflow-y: auto;
}

.map-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 12px;
  padding: 16px;
}

.tomb-cell {
  aspect-ratio: 1;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.tomb-cell:hover {
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.tomb-cell::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1), transparent);
  border-radius: inherit;
}

.search-field {
  background-color: white;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.search-field:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* Status indicators */
.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 8px;
  display: inline-block;
}

/* Dialog enhancements */
.v-dialog {
  border-radius: 12px;
  overflow: hidden;
}

.dialog-header {
  background: linear-gradient(45deg, var(--v-primary-base), var(--v-primary-darken1));
  color: white;
  padding: 16px 24px;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .map-grid {
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 8px;
  }

  .collection-btn {
    min-width: 120px;
    font-size: 0.875rem;
  }

  .header-section {
    padding: 16px;
  }

  .legend-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Animation classes */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.scale-enter-active,
.scale-leave-active {
  transition: all 0.3s ease;
}

.scale-enter-from,
.scale-leave-to {
  transform: scale(0.9);
  opacity: 0;
}

/* Print styles */
@media print {
  .tomb-management {
    background-color: white;
  }

  .collection-navigation,
  .search-field,
  .v-btn:not(.print-btn) {
    display: none;
  }

  .map-grid {
    page-break-inside: avoid;
  }

  .tomb-cell {
    border: 1px solid #ddd;
    print-color-adjust: exact;
    -webkit-print-color-adjust: exact;
  }
}
</style>