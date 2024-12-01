<template>
  <div class="settings-wrapper">
    <!-- Settings Button and Menu -->
    <div class="settings-content">
      <v-btn
        id="settings-activator"
        icon
        variant="text"
        color="primary"
        class="settings-btn"
      >
        <v-icon>mdi-cog</v-icon>
      </v-btn>

      <v-menu
        activator="#settings-activator"
        :close-on-content-click="true"
        transition="scale-transition"
        offset="10"
      >
        <v-card class="settings-menu" elevation="2">
          <v-list>
            <v-list-item
              v-for="(item, index) in settingsMenuItems"
              :key="index"
              class="menu-item"
              rounded="sm"
            >
              <template v-slot:prepend>
                <v-icon color="medium-emphasis">{{ item.icon }}</v-icon>
              </template>
              <template v-slot:title>
                <span class="text-body-1">{{ item.title }}</span>
              </template>
            </v-list-item>

            <v-divider class="my-2"></v-divider>

            <v-list-item
              @click="logout"
              class="menu-item"
              rounded="sm"
            >
              <template v-slot:prepend>
                <v-icon color="error">mdi-logout</v-icon>
              </template>
              <template v-slot:title>
                <span class="text-body-1">Logout</span>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-menu>
    </div>

    <!-- Loading Bar -->
    <v-progress-linear
      v-if="loggingOut"
      indeterminate
      color="primary"
      class="logout-progress"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loggingOut = ref(false);
const settingsMenuItems = ref([
  {
    title: 'Settings',
    icon: 'mdi-cog',
  },
  {
    title: 'About us',
    icon: 'mdi-information',
  },
]);

function logout() {
  loggingOut.value = true;
  setTimeout(() => {
    localStorage.removeItem('auth-token');
    router.push('/login');
    location.reload();
    console.log('token removed');
    loggingOut.value = false;
  }, 1000);
}
</script>

<style scoped>
.settings-wrapper {
  position: relative;
  /* Add these to properly handle the ml-2 class from parent */
  display: inline-block;
  margin-left: 8px; /* equivalent to ml-2 */
}

.settings-content {
  position: relative;
  display: inline-block;
}

.settings-menu {
  border-radius: 8px;
  min-width: 200px;
}

.menu-item {
  margin: 2px 4px;
  min-height: 40px;
  transition: background-color 0.2s ease;
}

.menu-item:hover {
  background-color: rgba(var(--v-theme-primary), 0.05);
}

:deep(.v-list-item__prepend) {
  padding-right: 12px;
}

.logout-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 999;
}
</style>