<template>
  <v-navigation-drawer
    v-model="drawerOpen"
    :width="drawerOpen ? 320 : 100"
    :rail="!drawerOpen"
    class="nav-drawer"
    :class="{ 'scrolled': scrolled }"
    :elevation="scrolled ? 4 : 0"
    app
    @mouseenter="openDrawer"
    @mouseleave="closeDrawer"
  >
    <!-- Fixed background container -->
    <div class="drawer-background"></div>

    <!-- Decorative Background Elements -->
    <div class="background-elements">
      <div class="gradient-orb primary"></div>
      <div class="gradient-orb secondary"></div>
      <div class="noise-overlay"></div>
    </div>

    <!-- Navigation Section -->
    <div class="nav-content">
      <!-- Primary Navigation -->
      <v-list class="nav-list px-2">
        <template v-for="(item, index) in navigationItems" :key="index">
          <!-- Section Divider -->
          <v-list-subheader 
            v-if="item.heading && drawerOpen" 
            class="text-caption font-weight-bold mt-4 mb-2"
          >
            {{ item.heading }}
          </v-list-subheader>

          <!-- Navigation Item -->
          <v-list-item
            v-if="!item.heading"
            :to="item.link"
            :active="$route.name === item.link.name"
            :ripple="false"
            class="nav-item mb-1"
            rounded="lg"
          >
            <!-- Item Layout -->
            <template v-slot:prepend>
              <div class="icon-container">
                <v-icon
                  :color="$route.name === item.link.name ? 'primary' : 'medium-emphasis'"
                  class="nav-icon"
                  :class="{ 'icon-active': $route.name === item.link.name }"
                >
                  {{ item.icon }}
                </v-icon>
                <div 
                  v-if="$route.name === item.link.name" 
                  class="icon-background"
                ></div>
              </div>
            </template>

            <v-list-item-title 
              class="nav-item-title"
              :class="{ 
                'hidden': !drawerOpen,
                'title-active': $route.name === item.link.name 
              }"
            >
              {{ item.title }}
            </v-list-item-title>

            <!-- Status Indicators -->
            <template v-slot:append>
              <div v-if="drawerOpen && item.status" class="status-indicator">
                <v-chip
                  v-if="item.status.type === 'badge'"
                  size="x-small"
                  :color="item.status.color"
                  class="status-badge"
                >
                  {{ item.status.content }}
                </v-chip>
                <v-icon
                  v-else-if="item.status.type === 'icon'"
                  :color="item.status.color"
                  size="small"
                >
                  {{ item.status.icon }}
                </v-icon>
              </div>
            </template>
          </v-list-item>
        </template>
      </v-list>
    </div>

    <!-- Bottom Actions Section -->
    <template v-slot:append>
      <div class="bottom-container pa-4">
        <div 
          v-if="drawerOpen && userProfile" 
          class="user-preview d-flex align-center mb-4"
        >
          <v-avatar size="42" class="user-avatar">
            <v-img 
              v-if="userAvatar" 
              :src="userAvatar"
              :alt="userProfile.first_name"
            >
              <template #placeholder>
              <v-responsive
                :aspect-ratio="1"
                class="d-flex align-center justify-center"
              >
                <span class="text-subtitle-2">
                  {{ getUserInitials }}
                </span>
              </v-responsive>
            </template>
            </v-img>
            <span v-else class="text-subtitle-2">
              {{ getUserInitials }}
            </span>
          </v-avatar>
          <div class="user-info ml-3">
            <p class="text-subtitle-2 mb-0 font-weight-medium">
              {{ `${userProfile.first_name} ${userProfile.last_name}` }}
            </p>
            <span class="text-caption text-medium-emphasis">
              {{ userProfile.role }}
            </span>
          </div>
          <v-btn
            icon="mdi-chevron-right"
            variant="text"
            size="small"
            class="ml-auto"
            @click="navigateToProfile"
          ></v-btn>
        </div>

        
      </div>
    </template>
  </v-navigation-drawer>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const drawerOpen = ref(true);
const isLoading = ref(false);
const scrolled = ref(false);

// User authentication and profile state
const apiUrl = 'http://localhost:8055';
const authToken = ref(localStorage.getItem('auth-token'));
const userAvatar = ref('');
const userProfile = ref(null);

// Scroll handler
const handleScroll = () => {
  scrolled.value = window.scrollY > 20;
};

// Computed property for user initials
const getUserInitials = computed(() => {
  if (!userProfile.value) return '';
  return `${userProfile.value.first_name?.[0] || ''}${userProfile.value.last_name?.[0] || ''}`;
});

// Lifecycle hooks
onMounted(() => {
  window.addEventListener('scroll', handleScroll);
  if (authToken.value) {
    fetchUserProfile();
  }
});

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

// Your existing functions
const fetchUserProfile = async () => {
  try {
    const response = await axios.get(
      `${apiUrl}/users/me?fields=avatar,first_name,last_name,email,title`,
      {
        headers: { 
          Authorization: `Bearer ${authToken.value}`
        }
      }
    );

    if (response.data.data.avatar) {
      userAvatar.value = `${apiUrl}/assets/${response.data.data.avatar}`;
    }

    userProfile.value = {
      first_name: response.data.data.first_name,
      last_name: response.data.data.last_name,
      email: response.data.data.email,
      role: response.data.data.title,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    if (error.response?.status === 401) {
      await handleLogout();
    }
  }
};

const navigateToProfile = () => {
  router.push('/account-profile');
};


const openDrawer = () => {
  drawerOpen.value = true;
};

const closeDrawer = () => {
  if (window.innerWidth < 960) {
    drawerOpen.value = false;
  }
};

const navigationItems = ref([
  { heading: 'MAIN' },
  { 
    link: { name: 'home' },
    icon: 'mdi-view-dashboard',
    title: 'Dashboard',
    status: { type: 'badge', content: '3', color: 'success' }
  },
  { 
    link: { name: 'managePlot' },
    icon: 'mdi-chart-box',
    title: 'Plot Management',
    status: { type: 'icon', icon: 'mdi-clock', color: 'warning' }
  },
  { heading: 'OPERATIONS' },
  { 
    link: { name: 'interment' },
    icon: 'mdi-plus-circle',
    title: 'New Interment',
    status: { type: 'badge', content: 'New', color: 'info' }
  },
  { 
    link: { name: 'generate' },
    icon: 'mdi-file-document',
    title: 'Reports',
  },
  
]);
</script>

<style scoped>
.nav-drawer {
  transition: all 0.3s ease !important;
  border-right: 1px solid transparent !important;
  background: transparent !important;
}

.drawer-background {
  position: absolute;
  inset: 0;
  background-color: transparent;
  transition: all 0.3s ease;
  z-index: 0;
}

.nav-drawer.scrolled {
  border-right: 1px solid rgba(0, 0, 0, 0.2) !important;
}

.nav-drawer.scrolled .drawer-background {
  background-color: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px);
}

/* Background elements */
.background-elements {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 1;
}

.gradient-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.08;
}

.gradient-orb.primary {
  width: 300px;
  height: 300px;
  top: -100px;
  left: -100px;
  background: radial-gradient(circle, var(--v-theme-primary), transparent 70%);
  animation: float 8s ease-in-out infinite;
}

.gradient-orb.secondary {
  width: 250px;
  height: 250px;
  bottom: -50px;
  right: -100px;
  background: radial-gradient(circle, var(--v-theme-secondary), transparent 70%);
  animation: float 10s ease-in-out infinite reverse;
}

/* Navigation items */
.nav-content {
  position: relative;
  z-index: 2;
}

.nav-item {
  position: relative;
  margin: 4px 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(4px);
  border-radius: 12px;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateX(4px);
}

/* Bottom section */
.bottom-container {
  position: relative;
  z-index: 2;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(8px);
  border-top: 1px solid rgba(255, 255, 255, 0.3);
}

.user-preview {
  background: rgba(255, 255, 255, 0.3);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 12px;
  transition: all 0.3s ease;
}

/* Dark mode */
:deep(.v-theme--dark) .nav-drawer.scrolled {
  border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
}

:deep(.v-theme--dark) .nav-drawer.scrolled .drawer-background {
  background-color: rgba(18, 18, 18, 0.9) !important;
}

/* Animations */
@keyframes float {
  0%, 100% { transform: translateY(0) scale(1); }
  50% { transform: translateY(10px) scale(1.05); }
}

/* Responsive */
@media (max-width: 960px) {
  .nav-drawer.scrolled .drawer-background {
    background-color: rgba(255, 255, 255, 0.95) !important;
  }
}
</style>