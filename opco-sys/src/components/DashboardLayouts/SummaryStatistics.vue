<template>
  <v-col cols="12" md="6" class="constatistic">
    <v-card class="summary-card glass-card fade-in">
      <v-card-title class="text-h6 mb-4">Overall Statistics</v-card-title>
      <v-card-text>
        <div class="stats-grid">
          <div class="main-stats">
            <div class="stat-box total-occupancy">
              <div class="stat-icon">
                <v-icon size="32" color="primary">mdi-account-group</v-icon>
              </div>
              <div class="stat-content">
                <div class="stat-label">
                  Total Occupancy
                  <v-tooltip bottom>
                    <template #activator="{ props }">
                      <v-icon v-bind="props" small @click.stop>
                        mdi-information
                      </v-icon>
                    </template>
                    <span>Total number of occupied spaces.</span>
                  </v-tooltip>
                </div>
                <div class="stat-value">{{ getTotalOccupancy() }}</div>
                <div class="stat-change" :class="getChangeClass(5)">
                  <v-icon small>{{ getChangeIcon(5) }}</v-icon>
                  <span>5% from last month</span>
                </div>
              </div>
            </div>

            <div class="stat-box available-spaces">
              <div class="stat-icon">
                <v-icon size="32" color="success">mdi-view-grid-plus</v-icon>
              </div>
              <div class="stat-content">
                <div class="stat-label">
                  Available Spaces
                  <v-tooltip bottom>
                    <template #activator="{ props }">
                      <v-icon v-bind="props" small @click.stop>
                        mdi-information
                      </v-icon>
                    </template>
                    <span>Total number of spaces currently available.</span>
                  </v-tooltip>
                </div>
                <div class="stat-value">{{ getTotalAvailable() }}</div>
                <div class="stat-change" :class="getChangeClass(-2)">
                  <v-icon small>{{ getChangeIcon(-2) }}</v-icon>
                  <span>2% from last month</span>
                </div>
              </div>
            </div>
          </div>

          <div class="additional-stats">
            <div class="stat-row">
              <div class="stat-item occupancy-rate">
                <div class="stat-mini-label">Occupancy Rate</div>
                <div class="stat-mini-value">{{ calculateOccupancyRate() }}%</div>
              </div>
            </div>

            <div class="capacity-utilization">
              <div class="util-label">Capacity Utilization</div>
              <div class="util-bar-container">
                <div class="util-bar-progress" :style="{ width: `${calculateUtilization()}%` }"></div>
              </div>
              <div class="util-value">{{ calculateUtilization() }}%</div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-col>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const apiUrl = 'http://localhost:8055';
const apartmentStoresEndpoint = `${apiUrl}/items/apartment_stores`;
const graveyardsEndpoint = `${apiUrl}/items/graveyards`;
const boneVaultStoresEndpoint = `${apiUrl}/items/bone_vault_stores`;
const apartmentBabyStoresEndpoint = `${apiUrl}/items/apartment_baby_stores`;
const burialRecordsEndpoint = `${apiUrl}/items/burial_records`;

const totalApartmentTombOccupied = ref(0);
const totalApartmentTombAvailable = ref(0);
const totalLotOccupied = ref(0);
const totalLotAvailable = ref(0);
const totalBoneVaultOccupied = ref(0);
const totalBoneVaultAvailable = ref(0);
const totalApartmentBabyTombOccupied = ref(0);
const totalApartmentBabyTombAvailable = ref(0);
const totalVacatedLastMonth = ref(0); // New ref for vacated count

const fetchData = async () => {
  try {
    const authToken = localStorage.getItem('auth-token');
    const responses = await Promise.all([
      axios.get(apartmentStoresEndpoint, { headers: { Authorization: `Bearer ${authToken}` } }),
      axios.get(graveyardsEndpoint, { headers: { Authorization: `Bearer ${authToken}` } }),
      axios.get(boneVaultStoresEndpoint, { headers: { Authorization: `Bearer ${authToken}` } }),
      axios.get(apartmentBabyStoresEndpoint, { headers: { Authorization: `Bearer ${authToken}` } }),
      axios.get(burialRecordsEndpoint, { headers: { Authorization: `Bearer ${authToken}` } }),
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

    const burialRecordsData = responses[4].data.data;
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    totalVacatedLastMonth.value = burialRecordsData.filter(record => new Date(record.date_of_death) >= lastMonthDate).length;

  } catch (error) {
    console.error(error);
  }
};

onMounted(fetchData);

const getTotalOccupancy = () => {
  return totalApartmentTombOccupied.value + 
         totalLotOccupied.value + 
         totalBoneVaultOccupied.value + 
         totalApartmentBabyTombOccupied.value;
};

const getTotalAvailable = () => {
  return totalApartmentTombAvailable.value + 
         totalLotAvailable.value + 
         totalBoneVaultAvailable.value + 
         totalApartmentBabyTombAvailable.value;
};

const getChangeClass = (change) => {
  return change > 0 ? 'positive-change' : 'negative-change';
};

const getChangeIcon = (change) => {
  return change > 0 ? 'mdi-arrow-up' : 'mdi-arrow-down';
};

const calculateOccupancyRate = () => {
  const total = getTotalOccupancy() + getTotalAvailable();
  return total > 0 ? Math.round((getTotalOccupancy() / total) * 100) : 0;
};

const calculateTurnoverRate = () => {
  const totalOccupiedLastMonth = totalApartmentTombOccupied.value + totalLotOccupied.value + totalBoneVaultOccupied.value + totalApartmentBabyTombOccupied.value;
  const turnover = totalVacatedLastMonth.value / totalOccupiedLastMonth * 100;
  return totalOccupiedLastMonth > 0 ? Math.round(turnover) : 0;
};

const calculateUtilization = () => {
  const total = getTotalOccupancy() + getTotalAvailable();
  return total > 0 ? Math.round((getTotalOccupancy() / total) * 100) : 0;
};
</script>

<style scoped>
.summary-card {
  height: 100%;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2));
  backdrop-filter: blur(10px);
  border-radius: 25px;
}

.stats-grid {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.main-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.stat-box {
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  display: flex;
 align-items: flex-start;
  gap: 16px;
  transition: all 0.3s ease;
}

.stat-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon {
  padding: 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 1.8rem;
  font-weight: 600;
  margin-bottom: 4px;
}

.stat-change {
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.additional-stats {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 20px;
}

.stat-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 20px;
}

.stat-mini-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 4px;
}

.stat-mini-value {
  font-size: 1.2rem;
  font-weight: 500;
}

.capacity-utilization {
  margin-top: 16px;
}

.util-label {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 8px;
}

.util-bar-container {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}

.util-bar-progress {
  height: 100%;
  background: linear-gradient(90deg, #4CAF50, #81C784);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.util-value {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.8);
  text-align: right;
}

.positive-change {
  color: #4CAF50;
}

.negative-change {
  color: #F44336;
}
</style>