<template>
    <v-container fluid>
        <!-- Search Engine -->
        <v-card class="soft-ui-card mb-4 pa-4" style="border-radius: 10px; padding: 20px; box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.1), -5px -5px 10px rgba(255, 255, 255, 0.1);">
          <v-card-title class="title">Search Reports</v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-row>
              <v-col cols="12">
                <v-text-field
                  v-model="searchQuery"
                  label="Search"
                  placeholder="Search reports..."
                  outlined
                ></v-text-field>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>

        <!-- Reports List -->
        <v-card class="soft-ui-card mb-4 pa-4" style="border-radius: 10px; padding: 20px; box-shadow: 5px 5px 10px rgba(0, 0, 0, 0.1), -5px -5px 10px rgba(255, 255, 255, 0.1);">
          <v-card-title class="title">Reports List</v-card-title>
          <v-divider></v-divider>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="reports"
              :search="searchQuery"
              class="elevation-2"
            >
              <template v-slot:item.actions="{ item }">
                <v-btn color="#fffff" @click="generateReport(item.type)">Generate Report</v-btn>
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>

        <!-- Report Editor (Modal) -->
        <v-dialog v-model="dialog" max-width="1000">
          <v-card>
            <v-card-title class="font-weight-bold">
              <span v-if="reportType === 'Burial'">Burial Report</span>
              <span v-else-if="reportType === 'Financial'">Financial Report</span>
              <span v-else-if="reportType === 'Plot Availability'">Plot Availability Report</span>
              <span v-else-if="reportType === 'Inventory'">Inventory Report</span>
              <v-spacer></v-spacer>
              <v-btn icon @click="dialog = false">
                <v-icon>mdi-close</v-icon>
              </v-btn>
            </v-card-title>
            <v-card-text>
              <!-- Your report editing component here (e.g., using a rich text editor) -->
              <v-textarea
                v-model="reportContent"
                label="Report Content"
                placeholder="Enter your report content here..."
              ></v-textarea>
            </v-card-text>
            <v-card-actions>
              <v-btn color="white" @click="saveReport">Save</v-btn>
              <v-btn color="secondary" @click="dialog = false">Cancel</v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>
        <v-card class="card">
            <!-- existing code -->
            <v-file-input
                v-model="file"
                label="Upload File"
                accept=".doc, .docx, .xls, .xlsx, .pdf"
                @change="uploadFile"
            />
            <v-btn @click="dragAndDrop">Drag and Drop File</v-btn>
            </v-card>

      </v-container>
</template>

<script setup>
</script>  

<style scoped>
</style>