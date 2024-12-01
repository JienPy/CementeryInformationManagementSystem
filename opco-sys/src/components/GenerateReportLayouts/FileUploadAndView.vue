<template>
  <div class="container-fluid">
    <div class="row">
      <!-- File List Section -->
      <div class="col-md-6">
        <div class="card">
          <h2 class="card-title">Reports List</h2>
          <div class="card-body">
            <!-- Search Input -->
            <div class="mb-3">
              <input
                type="text"
                v-model="searchQuery"
                placeholder="Search by File Title"
                class="form-control"
              />
            </div>
            <table class="table table-striped">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Size (MB)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="file in filteredFiles" :key="file.id">
                  <td>{{ file.filename_download }}</td>
                  <td>{{ file.type }}</td>
                  <td>{{ formatFileSize(file.storage) }}</td>
                  <td>
                    <button @click="generateReport(file)" class="btn btn-primary btn-sm">Generate Report</button>
                    <button @click="editFile(file)" class="btn btn-secondary btn-sm ml-2">Edit</button>
                  </td>
                </tr>
              </tbody>
            </table>
            <div class="mt-3">
              <label>Items per page:</label>
              <select v-model="itemsPerPage" class="form-select">
                <option>5</option>
                <option>10</option>
                <option>20</option>
              </select>
            </div>
            <nav aria-label="Page navigation" class="mt-3">
              <ul class="pagination">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <a class="page-link" href="#" @click.prevent="currentPage--">Previous</a>
                </li>
                <li class="page-item" v-for="page in totalPages" :key="page" :class="{ active: currentPage === page }">
                  <a class="page-link" href="#" @click.prevent="currentPage = page">{{ page }}</a>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <a class="page-link" href="#" @click.prevent="currentPage++">Next</a>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>

      <!-- Document Viewer Section -->
      <div class="col-md-6">
        <div class="card">
          <h2 class="card-title">Document Viewer</h2>
          <div class="card-body">
            <div v-if="selectedReport">
              <h3>{{ selectedReport.filename_download }}</h3>
              <div v-html="reportContent"></div>
            </div>
            <div v-else>
              <p>Select a file to generate and view the report.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Upload Dialog -->
  <div v-if="showUploadDialog" class="dialog">
    <div class="dialog-content">
      <h2 class="dialog-title">Upload File</h2>
      <input type="file" @change="handleFileUpload" multiple class="form-control" />
      <button @click="uploadFiles" class="btn btn-primary">Upload</button>
      <button @click="showUploadDialog = false" class="btn btn-secondary">Cancel</button>
    </div>
  </div>

  <!-- Edit File Section -->
  <div v-if="selectedFile" class="card mt-3">
    <h2 class="card-title">Edit File: {{ selectedFile.filename_download }}</h2>
    <div class="card-body">
      <input type="text" v-model="selectedFileName" class="form-control" />
      <button @click="saveFileChanges" class="btn btn-primary mt-2">Save</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

// Configuring API base URL and auth token
const apiUrl = 'http://localhost:8055'; // Directus API URL
const authToken = ref(localStorage.getItem('auth-token')); // Retrieve the token from localStorage
const router = useRouter(); // Use router for navigation if needed

// Refs for handling file and form data
const selectedFile = ref<any>(null);
const selectedFileName = ref<string>('');
const files = ref<any[]>([]);
const selectedFiles = ref<File[]>([]);
const searchQuery = ref<string>('');
const showUploadDialog = ref<boolean>(false);
const itemsPerPage = ref<number>(5);
const currentPage = ref<number>(1);
const selectedReport = ref<any>(null);
const reportContent = ref<string>('');

// Handle file input change
const handleFileUpload = (event: Event) => {
    const target = event.target as HTMLInputElement;
    if (target.files) {
        selectedFiles.value = Array.from(target.files);
    }
};

// Function to upload file(s) to the backend using Axios
const uploadFiles = async () => {
    if (selectedFiles.value.length === 0) {
        return alert('No file selected');
    }

    const formData = new FormData();
    selectedFiles.value.forEach((file) => {
        formData.append('file', file);
    });

    try {
        const response = await axios.post(`${apiUrl}/files`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Authorization': `Bearer ${authToken.value}`,
            },
        });

        if (response.status >= 200 && response.status < 300) {
            alert('Files uploaded successfully!');
            await fetchFiles();
            showUploadDialog.value = false;
        } else {
            alert('Failed to upload files');
        }
    } catch (error) {
        console.error(error);
    }
};

// Fetch files from the backend using Axios
const fetchFiles = async () => {
    try {
        const response = await axios.get(`${apiUrl}/files`, {
            headers: {
                'Authorization': `Bearer ${authToken.value}`,
            },
        });

        if (response.status >= 200 && response.status < 300) {
            files.value = response.data.data;
        } else {
            alert('Failed to fetch files');
        }
    } catch (error) {
        console.error(error);
    }
};

// Function to format file size in MB
const formatFileSize = (size: number) => {
    return (size / 1024 / 1024).toFixed(2);
};

// Function to edit a file
const editFile = (file: any) => {
    selectedFile.value = file;
    selectedFileName.value = file.filename_download;
};

// Function to save file changes
const saveFileChanges = async () => {
    try {
        const response = await axios.patch(`${apiUrl}/files/${selectedFile.value.id}`, {
            filename_download: selectedFileName.value,
        }, {
            headers: {
                'Authorization': `Bearer ${authToken.value}`,
            },
        });

        if (response.status >= 200 && response.status < 300) {
            alert('File updated successfully!');
            await fetchFiles();
            selectedFile.value = null;
        } else {
            alert('Failed to update file');
        }
    } catch (error) {
        console.error(error);
    }
};

// Computed property for filtering and paginating files
const filteredFiles = computed(() => {
    const filtered = files.value.filter((file) => {
        return file.filename_download.toLowerCase().includes(searchQuery.value.toLowerCase());
    });
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return filtered.slice(start, end);
});

// Compute total pages
const totalPages = computed(() => {
    return Math.ceil(files.value.filter((file) => 
        file.filename_download.toLowerCase().includes(searchQuery.value.toLowerCase())
    ).length / itemsPerPage.value);
});

// Function to generate and view a report
const generateReport = async (file: any) => {
    try {
        // In a real application, you would send a request to your backend to generate the report
        // For this example, we'll simulate it by fetching the file content
        const response = await axios.get(`${apiUrl}/files/${file.id}`, {
            headers: {
                'Authorization': `Bearer ${authToken.value}`,
            },
            responseType: 'blob',
        });

        if (response.status >= 200 && response.status < 300) {
            const reader = new FileReader();
            reader.onload = (e) => {
                reportContent.value = e.target?.result as string;
            };
            reader.readAsText(response.data);
            selectedReport.value = file;
        } else {
            alert('Failed to generate report');
        }
    } catch (error) {
        console.error(error);
    }
};

// Fetch files on component mount
fetchFiles();
</script>

<style scoped>
.container-fluid {
  padding: 20px;
}

.card {
  margin-bottom: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.card-title {
  margin-top: 0;
  padding: 15px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
}

.card-body {
  padding: 20px;
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th, .table td {
  border: 1px solid #dee2e6;
  padding: 10px;
  text-align: left;
}

.table th {
  background-color: #f8f9fa;
}

.dialog {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.dialog-content {
  background-color: white;
  padding: 20px;
  border-radius: 5px;
}

.pagination {
  justify-content: center;
  margin-top: 20px;
}
</style>