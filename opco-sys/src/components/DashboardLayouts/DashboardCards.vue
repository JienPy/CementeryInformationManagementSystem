<template>
  <div class="dashboard-container mt-6">
    <v-scale-transition>
      <v-row class="custom-row">
        <v-col
          v-for="(card, index) in cards"
          :key="index"
          cols="12"
          md="3"
          sm="6"
          class="card-column"
          :style="{ '--index': index }"
        >
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              v-bind="props"
              :class="[
                'dashboard-card',
                `theme-${index + 1}`,
                { 'on-hover': isHovering }
              ]"
              elevation="8"
            >
              <div class="card-progress-indicator" :style="{ width: getProgressWidth(card) + '%' }"></div>
              
              <v-card-item>
                <div class="d-flex justify-space-between align-center">
                  <div class="card-icon-wrapper">
                    <v-icon :color="getIconColor(index)" size="32" class="card-icon">
                      {{ getCardIcon(card.title) }}
                    </v-icon>
                  </div>
                  
                  <v-menu>
                    <template v-slot:activator="{ props }">
                      <v-btn
                        icon
                        variant="text"
                        v-bind="props"
                        class="action-button"
                      >
                        <v-icon>mdi-dots-vertical</v-icon>
                      </v-btn>
                    </template>
                    <v-list>
                      <v-list-item @click="showDetails(card)">
                        <v-list-item-title>View Details</v-list-item-title>
                      </v-list-item>
                      <v-list-item @click="openDownloadDialog(card.title)">
                        <v-list-item-title>Download Report</v-list-item-title>
                      </v-list-item>
                    </v-list>
                  </v-menu>
                </div>
              </v-card-item>

              <v-card-text>
                <div class="stats-container">
                  <h2 class="stats-value">{{ card.subtitle }}</h2>
                  <p class="stats-label">{{ card.title }}</p>
                </div>
                <div class="availability-info">
                  <v-tooltip location="bottom">
                    <template v-slot:activator="{ props }">
                      <div class="availability-bar" v-bind="props">
                        <div 
                          class="availability-progress"
                          :style="{ width: getAvailabilityPercentage(card) + '%' }"
                        ></div>
                      </div>
                    </template>
                    <span>{{ card.occupiedText }}</span>
                  </v-tooltip>
                </div>
              </v-card-text>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-scale-transition>

    <!-- Modal for File Type Selection -->
    <v-dialog v-model="dialog" max-width="400">
      <v-card>
        <v-card-title>Select File Type</v-card-title>
        <v-card-text>
          <v-radio-group v-model="selectedFileType">
            <v-radio label="DOC" value="doc"></v-radio>
            <v-radio label="PDF" value="pdf"></v-radio>
            <v-radio label="CSV" value="csv"></v-radio>
          </v-radio-group>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="primary" @click="downloadReport">Download</v-btn>
          <v-btn @click="dialog = false">Cancel</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

const apiUrl = 'http://localhost:8055';
const apartmentStoresEndpoint = `${apiUrl}/items/apartment_stores`;
const graveyardsEndpoint = `${apiUrl}/items/graveyards`;
const boneVaultStoresEndpoint = `${apiUrl}/items/bone_vault_stores`;
const apartmentBabyStoresEndpoint = `${apiUrl}/items/apartment_baby_stores`;

const totalApartmentTombAvailable = ref(0);
const totalLotAvailable = ref(0);
const totalBoneVaultAvailable = ref(0);
const totalApartmentBabyTombAvailable = ref(0);

const totalApartmentTombOccupied = ref(0);
const totalLotOccupied = ref(0);
const totalBoneVaultOccupied = ref(0);
const totalApartmentBabyTombOccupied = ref(0);

const historicalData = ref({
  apartmentTombAvailable: [],
  apartmentBabyTombAvailable: [],
  lotAvailable: [],
  boneVaultAvailable: []
});

const fetchData = async () => {
  try {
    const authToken = localStorage.getItem('auth-token');
    const responses = await Promise.all([
      axios.get(apartmentStoresEndpoint, { headers: { Authorization: `Bearer ${authToken}` } }),
      axios.get(graveyardsEndpoint, { headers: { Authorization: `Bearer ${authToken}` } }),
      axios.get(boneVaultStoresEndpoint, { headers: { Authorization: `Bearer ${authToken}` } }),
      axios.get(apartmentBabyStoresEndpoint, { headers: { Authorization: `Bearer ${authToken}` } }),
    ]);

    const apartmentData = responses[0].data.data;
    totalApartmentTombAvailable.value = apartmentData.filter(item => item.status === null || item.status === 'available').length;
    totalApartmentTombOccupied.value = apartmentData.filter(item => item.status !== null && item.status !== 'available').length;

    const graveyardData = responses[1].data.data;
    totalLotAvailable.value = graveyardData.filter(item => item.status === null || item.status === 'available').length;
    totalLotOccupied.value = graveyardData.filter(item => item.status !== null && item.status !== 'available').length;

    const boneVaultData = responses[2].data.data;
    totalBoneVaultAvailable.value = boneVaultData.filter(item => item.status === null || item.status === 'available').length;
    totalBoneVaultOccupied.value = boneVaultData.filter(item => item.status !== null && item.status !== 'available').length;

    const apartmentBabyData = responses[3].data.data;
    totalApartmentBabyTombAvailable.value = apartmentBabyData.filter(item => item.status === null || item.status === 'available').length;
    totalApartmentBabyTombOccupied.value = apartmentBabyData.filter(item => item.status !== null && item.status !== 'available').length;

  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

onMounted(fetchData);

const cards = computed(() => [
  {
    title: 'Apartment Tomb Available',
    subtitle: totalApartmentTombAvailable.value,
    occupiedText: `Occupied APT: ${totalApartmentTombOccupied.value}`,
    info: `This is a summary of apartment tomb available: ${totalApartmentTombAvailable.value} available, ${totalApartmentTombOccupied.value} occupied.`,
    historicalData: historicalData.value.apartmentTombAvailable
  },
  {
    title: 'Apartment Tomb Baby Available',
    subtitle: totalApartmentBabyTombAvailable.value,
    occupiedText: `Occupied APT Baby: ${totalApartmentBabyTombOccupied.value}`,
    info: `This is a summary of apartment tomb baby available: ${totalApartmentBabyTombAvailable.value} available, ${totalApartmentBabyTombOccupied.value} occupied.`,
    historicalData: historicalData.value.apartmentBabyTombAvailable
  },
  {
    title: 'Lot Available',
    subtitle: totalLotAvailable.value,
    occupiedText: `Occupied Lot: ${totalLotOccupied.value}`,
    info: `This is a summary of lot available: ${totalLotAvailable.value} available, ${totalLotOccupied.value} occupied.`,
    historicalData: historicalData.value.lotAvailable
  },
  {
    title: 'Bone Vault Available',
    subtitle: totalBoneVaultAvailable.value,
    occupiedText: `Occupied Vault: ${totalBoneVaultOccupied.value}`,
    info: `This is a summary of bone vault available: ${totalBoneVaultAvailable.value} available, ${totalBoneVaultOccupied.value} occupied.`,
    historicalData: historicalData.value.boneVaultAvailable
  },
]);

const getCardIcon = (title) => {
  const icons = {
    'Apartment Tomb Available': 'mdi-home',
    'Apartment Tomb Baby Available': 'mdi-baby-carriage',
    'Lot Available': 'mdi-map-marker',
    'Bone Vault Available': 'mdi-archive'
  };
  return icons[title] || 'mdi-chart-box';
};

const getIconColor = (index) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
  return colors[index % colors.length];
};

const getProgressWidth = (card) => {
  const total = parseInt(card.subtitle) + parseInt(card.occupiedText.match(/\d+/)[0]);
  return (parseInt(card.occupiedText.match(/\d+/)[0]) / total) * 100;
};

const getAvailabilityPercentage = (card) => {
  const available = parseInt(card.subtitle);
  const total = parseInt(card.subtitle) + parseInt(card.occupiedText.match(/\d+/)[0]);
  return (available / total) * 100;
};

const showDetails = (card) => {
  console.log('Show details for:', card.title);
};

const dialog = ref(false);
const selectedFileType = ref('');

const openDownloadDialog = (title) => {
  dialog.value = true;
};

const downloadReport = () => {
  if (selectedFileType.value) {
    // Logic to download the report based on the selected file type
    console.log(`Downloading ${selectedFileType.value} report...`);
    // Here you would typically make an API call to generate/download the report
    // For example:
    // axios.get(`${apiUrl}/download/report?type=${selectedFileType.value}`)
    //   .then(response => {
    //     // Handle the response, e.g., trigger file download
    //   });
    dialog.value = false; // Close the dialog after download
  } else {
    console.error('No file type selected');
  }
};
</script>

<style scoped>
.dashboard-card {
  position: relative;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 16px;
}

.theme-1 { background: linear-gradient(135deg, #f18c8c, #f68eff); }
.theme-2 { background: linear-gradient(135deg, #8adfd9, #4edb84); }
.theme-3 { background: linear-gradient(135deg, #96CEB4, #FFEEAD); }
.theme-4 { background: linear-gradient(135deg, #45B7D1, #cd4e59); }

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-column {
  animation: slideIn 0.3s ease forwards;
  animation-delay: calc(var(--index) * 100ms);
}
</style>