<template>
  <v-app>
    <!-- App Bar (Top Navigation) -->
    <AppBar />

    <!-- Navigation Drawer (Left Side) -->
    <NavigationDrawer />

    <v-main  class="mainStyle">
      <v-container fluid>
        <v-row>
          <v-col > <!-- Add a column for the DeceaseForm -->
            <DeceaseForm class="mt-0"/>
          </v-col>
            
        </v-row>
      </v-container>
    </v-main>
    
  </v-app>
</template>

<script setup>

import AppBar from '../components/AppBar.vue';
import NavigationDrawer from '../components/NavigationDrawer.vue';
import DeceaseForm from '@/components/IntermentView/DeceaseForm.vue'; // corrected import

</script>

<style scoped>
.mainStyle {
  background-color: #90A4AE;
}
</style>