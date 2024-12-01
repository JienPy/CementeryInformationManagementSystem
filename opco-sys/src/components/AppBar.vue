<template>
  <v-app-bar 
    app 
    :elevation="scrolled ? 4 : 0"
    :color="scrolled ? 'white' : 'transparent'"
    height="70"
    class="app-bar-container"
    :class="{ 'scrolled': scrolled }"
  >
    <div class="d-flex align-center app-bar-content">
      <!-- Left section -->
      <div class="left-section d-flex align-center">
        <LogoCom class="mr-4" />
        <v-divider vertical class="mx-4 hidden-sm-and-down" />
        
      </div>

      <v-spacer />

      <!-- Right section -->
      <div class="right-section d-flex align-center">
        <NotificationsCom class="mx-2" />
        <v-divider vertical class="mx-4" />
       
        <SettingsCom class="ml-2" />
      </div>
    </div>

    <!-- Mobile search (visible on small screens) -->
    <v-expand-transition>
      <div v-if="isMobileSearchVisible" class="mobile-search pa-2">
        <SearchCom />
      </div>
    </v-expand-transition>
  </v-app-bar>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import SettingsCom from './AppBarLayouts/SettingsCom.vue';
import LogoCom from './AppBarLayouts/LogoCom.vue';
import NotificationsCom from './AppBarLayouts/NotificationsCom.vue';
import SearchCom from './AppBarLayouts/SearchCom.vue';
import ProfileCom from './AppBarLayouts/ProfileCom.vue';

const scrolled = ref(false);
const isMobileSearchVisible = ref(false);

const handleScroll = () => {
  scrolled.value = window.scrollY > 20;
};

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style scoped>
.app-bar-container {
  transition: all 0.3s ease;
  border-bottom: 1px solid transparent;
}

.app-bar-container.scrolled {
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  background-color: rgba(255, 255, 255, 0.9) !important;
}

.app-bar-content {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 16px;
}

.left-section,
.right-section {
  gap: 8px;
}

.mobile-search {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

/* Custom divider styling */
.v-divider {
  opacity: 0.6;
  height: 24px !important;
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .app-bar-container {
    height: 60px !important;
  }
  
  .app-bar-content {
    padding: 0 8px;
  }
}

/* Optional: Add hover effects for interactive elements */
:deep(.v-btn) {
  transition: transform 0.2s ease;
}

:deep(.v-btn:hover) {
  transform: translateY(-1px);
}
</style>