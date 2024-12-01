<template>
    <v-col cols="12" md="6">
      <v-card class="pie-chart-card glass-card fade-in">
        <div class="chart-container">
          <canvas id="pieChart"></canvas>
        </div>
      </v-card>
    </v-col>
  </template>
  
  <script setup>
  import { ref, onMounted, nextTick } from 'vue';
  import { Chart, registerables, ArcElement, PieController } from 'chart.js';
  import axios from 'axios';
  
  const totalApartmentTombOccupied = ref(0);
  const totalApartmentBabyTombOccupied = ref(0);
  const totalLotOccupied = ref(0);
  const totalBoneVaultOccupied = ref(0);
  
  const apiUrl = 'http://localhost:8055';

  const apartmentStoresEndpoint = `${apiUrl}/items/apartment_stores`;
  const graveyardsEndpoint = `${apiUrl}/items/graveyards`;
  const boneVaultStoresEndpoint = `${apiUrl}/items/bone_vault_stores`;
  const apartmentBabyStoresEndpoint = `${apiUrl}/items/apartment_baby_stores`;
  
  Chart.register(...registerables, ArcElement, PieController);
  
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
  
      const graveyardData = responses[1].data.data;
      totalLotOccupied.value = graveyardData.filter(item => item.status !== null && item.status !== 'available').length;
  
      const boneVaultData = responses[2].data.data;
      totalBoneVaultOccupied.value = boneVaultData.filter(item => item.status !== null && item.status !== 'available').length;
  
      const apartmentBabyData = responses[3].data.data;
      totalApartmentBabyTombOccupied.value = apartmentBabyData.filter(item => item.status !== null && item.status !== 'available').length;
    } catch (error) {
      console.error(error);
    }
  };
  
// Create Pie Chart function
const createEnhancedPieChart = async () => {
  await fetchData(); // Ensure data is fetched before creating the chart

  nextTick(() => {
    const ctx = document.getElementById('pieChart').getContext('2d');
    // Create sophisticated gradient backgrounds
    const createGradient = (ctx, colorStart, colorEnd) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, colorStart);
      gradient.addColorStop(1, colorEnd);
      return gradient;
    };

    const gradients = [
      createGradient(ctx, 'rgba(255, 99, 132, 0.9)', 'rgba(255, 99, 132, 0.4)'),
      createGradient(ctx, 'rgba(54, 162, 235, 0.9)', 'rgba(54, 162, 235, 0.4)'),
      createGradient(ctx, 'rgba(255, 206, 86, 0.9)', 'rgba(255, 206, 86, 0.4)'),
      createGradient(ctx, 'rgba(75, 192, 192, 0.9)', 'rgba(75, 192, 192, 0.4)'),
    ];

    // Create shadow effect for 3D-like appearance
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    
    const data = {
      labels: [
        'Apartment Tomb Occupied', 
        'Apartment Tomb Baby Occupied', 
        'Lot Occupied', 
        'Bone Vault Occupied', 
        
      ],
      datasets: [{
        label: 'Occupancy',
        data: [
          totalApartmentTombOccupied.value,
          totalApartmentBabyTombOccupied.value,
          totalLotOccupied.value,
          totalBoneVaultOccupied.value,
        ],
        backgroundColor: gradients,
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 2,
        hoverOffset: 20,
        offset: 10, // Creates spacing between segments
      }],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: {
            boxWidth: 20,
            padding: 20,
            usePointStyle: true,
            color: '#FFFFFF',
            font: {
              size: 14,
              weight: 'bold',
            },
          },
        },  
        title: {
          display: true,
          text: 'Comparative Analysis of Tomb Occupants',
          padding: {
            top: 30,
            bottom: 30
          },
          color: '#000000',
          font: {
            size: 20,
            weight: 'bold',
            family: "'Helvetica Neue', 'Helvetica', 'Arial', sans-serif"
          },
        },
        tooltip: {
          enabled: true,
          callbacks: {
            label: (context) => {
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((context.raw / total) * 100);
              return `${context.label}: ${context.raw} (${percentage}%)`;
            },
          },
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleFont: { size: 16, weight: 'bold' },
          bodyFont: { size: 14 },
          padding: 12,
          borderColor: 'rgba(255, 255, 255, 0.1)',
          borderWidth: 1,
          position: 'nearest',
        },
      },
      animation: {
        animateRotate: true,
        animateScale: true,
        duration: 2000,
        easing: 'easeInOutQuart',
      },
      layout: {
        padding: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 20
        }
      },
      elements: {
        arc: {
          borderWidth: 2,
          borderColor: 'rgba(255, 255, 255, 0.8)',
          hoverBorderColor: 'white',
        }
      },
      rotation: -45, // Start rotation angle
    };

    let chart = new Chart(ctx, {
      type: 'pie',
      data: data,
      options: options,
    });

    // Add rotation animation
    let currentRotation = -45;
    let targetRotation = currentRotation;
    let animating = false;

    function animate() {
      if (Math.abs(currentRotation - targetRotation) > 0.1) {
        currentRotation += (targetRotation - currentRotation) * 0.1;
        chart.options.rotation = currentRotation;
        chart.update('none');
        requestAnimationFrame(animate);
      } else {
        animating = false;
      }
    }

    // Add interactivity
    ctx.canvas.addEventListener('mousemove', (e) => {
      const rect = ctx.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate angle based on mouse position
      const dx = x - chart.getDatasetMeta(0).data[0].x;
      const dy = y - chart.getDatasetMeta(0).data[0].y;
      targetRotation = Math.atan2(dy, dx) * 180 / Math.PI - 90;
      
      if (!animating) {
        animating = true;
        animate();
      }
    });

    // Add hover effect for segments
    chart.options.onHover = (event, elements) => {
      if (elements && elements.length) {
        const segment = elements[0];
        chart.getDatasetMeta(0).data.forEach((arc, index) => {
          const distance = index === segment.index ? 10 : 0;
          arc.options.offset = distance;
        });
        chart.update();
      }
    };


  });
};

  onMounted(() => {
    createEnhancedPieChart();
  });
  </script>
  
  <style scoped>
  .pie-chart-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.2));
  backdrop-filter: blur(10px);
  border-radius: 25px;
  box-shadow: 
    0 8px 32px 0 rgba(31, 38, 135, 0.37),
    inset 0 0 32px rgba(255, 255, 255, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  justify-content: center;
  width: 600px;
  height: 600px;
  display: flex;
  align-items: center;
  margin: 0 auto;
  padding: 20px;
  opacity: 0;
  animation: fadeIn 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  position: relative;
  overflow: hidden;
}
.pie-chart-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    45deg,
    transparent 0%,
    rgba(255, 255, 255, 0.1) 50%,
    transparent 100%
  );
  z-index: 1;
  animation: shine 3s infinite linear;
}
.pie-chart-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 
    0 12px 48px 0 rgba(31, 38, 135, 0.45),
    inset 0 0 32px rgba(255, 255, 255, 0.2);
}

.chart-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  padding: 20px;
  z-index: 2;
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes shine {
  from {
    transform: translateX(-100%) rotate(45deg);
  }
  to {
    transform: translateX(200%) rotate(45deg);
  }
}
 /* Add depth effect to the chart container */
.chart-container::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 10%;
  right: 10%;
  height: 20px;
  background: radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, transparent 70%);
  filter: blur(5px);
  z-index: -1;
}

  </style>