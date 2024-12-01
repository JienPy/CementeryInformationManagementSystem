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
                      <v-list-item @click="createReport(card.title)">
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
                    <span>{{ card.availableText }}</span>
                  </v-tooltip>
                </div>
              </v-card-text>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>
    </v-scale-transition>
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

const totalApartmentTombOccupied = ref(0);
const totalApartmentTombAvailable = ref(0);
const totalLotOccupied = ref(0);
const totalLotAvailable = ref(0);
const totalBoneVaultOccupied = ref(0);
const totalBoneVaultAvailable = ref(0);
const totalApartmentBabyTombOccupied = ref(0);
const totalApartmentBabyTombAvailable = ref(0);

// Previous historical data to calculate trend
const historicalData = ref({
  apartmentTombOccupied: [],
  apartmentBabyTombOccupied: [],
  lotOccupied: [],
  boneVaultOccupied: []
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
    totalApartmentTombOccupied.value = apartmentData.filter(item => item.status !== null && item.status !== 'available').length;
    totalApartmentTombAvailable.value = apartmentData.filter(item => item.status === null || item.status === 'available').length;

    const graveyardData = responses[1].data.data;
    totalLotOccupied.value = graveyardData.filter(item => item.status !== null && item.status !== 'available').length;
    totalLotAvailable.value = graveyardData.filter(item => item.status === null || item.status === 'available').length;

    const boneVaultData = responses[2].data.data;
    totalBoneVaultOccupied.value = boneVaultData.filter(item => item.status !== null && item.status !== 'available').length;
    totalBoneVaultAvailable.value = boneVaultData.filter(item => item.status === null || item.status === 'available').length;

    const apartmentBabyData = responses[3].data.data;
    totalApartmentBabyTombOccupied.value = apartmentBabyData.filter(item => item.status !== null && item.status !== 'available').length;
    totalApartmentBabyTombAvailable.value = apartmentBabyData.filter(item => item.status === null || item.status === 'available').length;

  } catch (error) {
    console.error('Error fetching data:', error);
  }
};

onMounted(fetchData);

const cards = computed(() => [
  {
    title: 'Apartment Tomb Occupied',
    subtitle: totalApartmentTombOccupied.value,
    availableText: `Available APT: ${totalApartmentTombAvailable.value}`,
    info: `This is a summary of apartment tomb occupied: ${totalApartmentTombOccupied.value} occupied, ${totalApartmentTombAvailable.value} available.`,
    historicalData: historicalData.value.apartmentTombOccupied
  },
  {
    title: 'Apartment Tomb Baby Occupied',
    subtitle: totalApartmentBabyTombOccupied.value,
    availableText: `Available APT Baby: ${totalApartmentBabyTombAvailable.value}`,
    info: `This is a summary of apartment tomb baby occupied: ${totalApartmentBabyTombOccupied.value} occupied, ${totalApartmentBabyTombAvailable.value} available.`,
    historicalData: historicalData.value.apartmentBabyTombOccupied
  },
  {
    title: 'Lot Occupied',
    subtitle: totalLotOccupied.value,
    availableText: `Remaining Lot: ${totalLotAvailable.value}`,
    info: `This is a summary of lot occupied: ${totalLotOccupied.value} occupied, ${totalLotAvailable.value} available.`,
    historicalData: historicalData.value.lotOccupied
  },
  {
    title: 'Bone Vault Occupied',
    subtitle: totalBoneVaultOccupied.value,
    availableText: `Remaining Vault: ${totalBoneVaultAvailable.value}`,
    info: `This is a summary of bone vault occupied: ${totalBoneVaultOccupied.value} occupied, ${totalBoneVaultAvailable.value} available.`,
    historicalData: historicalData.value.boneVaultOccupied
  },
]);

// Updated helper methods to use actual data
const getCardIcon = (title) => {
  const icons = {
    'Apartment Tomb Occupied': 'mdi-home',
    'Apartment Tomb Baby Occupied': 'mdi-baby-carriage',
    'Lot Occupied': 'mdi-map-marker',
    'Bone Vault Occupied': 'mdi-archive'
  };
  return icons[title] || 'mdi-chart-box';
};

const getIconColor = (index) => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];
  return colors[index % colors.length];
};

const getProgressWidth = (card) => {
  const total = parseInt(card.subtitle) + parseInt(card.availableText.match(/\d+/)[0]);
  return (parseInt(card.subtitle) / total) * 100;
};


const getAvailabilityPercentage = (card) => {
  const available = parseInt(card.availableText.match(/\d+/)[0]);
  const total = parseInt(card.subtitle) + available;
  return (available / total) * 100;
};

const showDetails = (card) => {
  // Placeholder for showing details logic
  console.log('Show details for:', card.title);
};

const createReport = (title) => {
  // Placeholder for creating report logic
  console.log('Create report for:', title);
};
</script>
  
  <style scoped>
  /* Existing styles from the previous artifact, preserving the card and dashboard styling */
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