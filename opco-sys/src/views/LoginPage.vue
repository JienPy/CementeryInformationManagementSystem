<template>
  <v-app>
    <v-main class="login-wrapper">
      <!-- Left Panel - Decorative Side -->
      <div class="left-panel">
        <div class="overlay"></div>
        <div class="content-wrapper">
          <div class="brand-section">
            <img src="/OCP_logo.png" alt="OCP Logo" class="company-logo" />
            <h1 class="brand-name">Cemetery Management System</h1>
          </div>
          <div class="feature-cards">
            <div class="feature-card" v-for="(feature, index) in features" :key="index">
              <v-icon size="32" color="white">{{ feature.icon }}</v-icon>
              <h3>{{ feature.title }}</h3>
              <p>{{ feature.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Panel - Login Form -->
      <div class="right-panel">
        <v-container class="form-container">
          <v-card class="login-card" elevation="0">
            <div class="login-header">
              <h2 class="welcome-text">Welcome Back</h2>
              <p class="subtitle-text">Please sign in to continue</p>
            </div>

            <v-form @submit.prevent="login" class="login-form" ref="form">
              <transition-group name="fade-stagger" tag="div" class="input-group">
                <!-- Error Alert -->
                <v-alert
                  v-if="errorMessage"
                  key="error"
                  type="error"
                  variant="tonal"
                  class="mb-4 error-alert"
                  closable
                >
                  {{ errorMessage }}
                </v-alert>

                <!-- Email Field -->
                <div key="email" class="input-wrapper">
                  <label class="input-label">Email Address</label>
                  <v-text-field
                    v-model="email"
                    :rules="emailRules"
                    placeholder="Enter your email"
                    variant="outlined"
                    bg-color="white"
                    class="custom-input"
                    prepend-inner-icon="mdi-email-outline"
                    :disabled="isLoading"
                  />
                </div>

                <!-- Password Field -->
                <div key="password" class="input-wrapper">
                  <label class="input-label">Password</label>
                  <v-text-field
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    :rules="passwordRules"
                    placeholder="Enter your password"
                    variant="outlined"
                    bg-color="white"
                    class="custom-input"
                    prepend-inner-icon="mdi-lock-outline"
                    :append-inner-icon="showPassword ? 'mdi-eye-outline' : 'mdi-eye-off-outline'"
                    @click:append-inner="showPassword = !showPassword"
                    :disabled="isLoading"
                  />
                </div>

                <!-- Remember & Forgot Password -->
                <div key="options" class="options-row">
                  <v-checkbox
                    v-model="rememberMe"
                    label="Remember me"
                    color="primary"
                    hide-details
                    class="remember-checkbox"
                  />
                  <a @click="router.push('/request-new-password')" class="forgot-link">
                    Forgot password?
                  </a>
                </div>

                <!-- Login Button -->
                <div key="button" class="button-wrapper">
                  <v-btn
                    type="submit"
                    :loading="isLoading"
                    block
                    class="login-btn"
                    min-height="48"
                  >
                    {{ isLoading ? 'Signing in...' : 'Sign in' }}
                  </v-btn>
                </div>
              </transition-group>
            </v-form>

            <!-- Security Notice -->
            <div class="security-notice">
              <v-icon size="20" color="grey-darken-1" class="mr-2">
                mdi-shield-check-outline
              </v-icon>
              <span>Secure, encrypted connection</span>
            </div>
          </v-card>
        </v-container>
      </div>
    </v-main>
  </v-app>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

const apiUrl = 'http://localhost:8055';
const authEndpoint = `${apiUrl}/auth/login`;
const router = useRouter();

// Form data
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const rememberMe = ref(false);
const isLoading = ref(false);
const errorMessage = ref('');
const form = ref(null);

// Feature cards data
const features = [
  {
    icon: 'mdi-shield-check',
    title: 'Secure Access',
    description: 'Enterprise-grade security for your data'
  },
  {
    icon: 'mdi-chart-timeline-variant',
    title: 'Real-time Updates',
    description: 'Instant synchronization across all devices'
  },
  {
    icon: 'mdi-account-group',
    title: 'Team Management',
    description: 'Efficient staff and resource coordination'
  }
];

// Validation rules
const emailRules = [
  v => !!v || 'Email is required',
  v => /.+@.+\..+/.test(v) || 'Please enter a valid email'
];

const passwordRules = [
  v => !!v || 'Password is required',
  v => v.length >= 6 || 'Password must be at least 6 characters'
];

// Login handler
const login = async () => {
  if (!form.value.validate()) return;
  
  isLoading.value = true;
  errorMessage.value = '';
  
  try {
    const response = await axios.post(authEndpoint, {
      email: email.value,
      password: password.value,
    });

    if (rememberMe.value) {
      localStorage.setItem('remember-email', email.value);
    }


    const token = "IolMls_vrmy_ZSb4xRT8y0YT7KxVW1tY"
    //const token = response.data.data.access_token;
    localStorage.setItem('auth-token', token);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    router.push('/dashboard');
  } catch (error) {
    errorMessage.value = error.response?.status === 401
      ? 'Invalid email or password'
      : 'An error occurred. Please try again.';
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  const rememberedEmail = localStorage.getItem('remember-email');
  if (rememberedEmail) {
    email.value = rememberedEmail;
    rememberMe.value = true;
  }
});
</script>

<style scoped>
.login-wrapper {
  display: flex;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.left-panel {
  flex: 1;
  position: relative;
  background-image: url("/cemetery-bg-2.png");
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  min-width: 500px;
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 100%);
  backdrop-filter: blur(4px);
}

.content-wrapper {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 600px;
  color: white;
}

.brand-section {
  text-align: center;
  margin-bottom: 48px;
  animation: fadeInUp 0.8s ease-out;
}

.company-logo {
  width: 120px;
  height: auto;
  margin-bottom: 24px;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

.brand-name {
  font-size: 2.5rem;
  font-weight: 600;
  margin: 0;
  line-height: 1.2;
  text-shadow: 0 2px 4px rgba(0,0,0,0.3);
}

.feature-cards {
  display: grid;
  gap: 24px;
  margin-top: 48px;
}

.feature-card {
  background: rgba(255,255,255,0.1);
  padding: 24px;
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
  animation: fadeInUp 0.8s ease-out backwards;
}

.feature-card:nth-child(1) { animation-delay: 0.2s; }
.feature-card:nth-child(2) { animation-delay: 0.4s; }
.feature-card:nth-child(3) { animation-delay: 0.6s; }

.feature-card h3 {
  margin: 16px 0 8px;
  font-size: 1.25rem;
  font-weight: 600;
}

.feature-card p {
  margin: 0;
  opacity: 0.8;
  font-size: 0.95rem;
  line-height: 1.5;
}

.right-panel {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px;
  background-color: white;
  min-width: 500px;
}

.form-container {
  width: 100%;
  max-width: 460px;
}

.login-card {
  background: transparent;
  width: 100%;
}

.login-header {
  text-align: center;
  margin-bottom: 40px;
  animation: fadeInUp 0.6s ease-out;
}

.welcome-text {
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
  line-height: 1.2;
}

.subtitle-text {
  color: #666;
  margin-top: 8px;
  font-size: 1.1rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-wrapper {
  animation: fadeInUp 0.6s ease-out backwards;
}

.input-label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #1a1a1a;
}

.custom-input {
  border-radius: 12px;
}

.custom-input :deep(.v-field) {
  border-radius: 12px !important;
  background-color: #f8f9fa !important;
}

.options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: -8px 0;
}

.remember-checkbox {
  font-size: 0.95rem;
}

.forgot-link {
  color: #2196F3;
  text-decoration: none;
  font-size: 0.95rem;
  font-weight: 500;
  transition: color 0.2s;
}

.forgot-link:hover {
  color: #1976D2;
  text-decoration: underline;
}

.button-wrapper {
  margin-top: 8px;
}

.login-btn {
  background: linear-gradient(135deg, #1976D2, #2196F3) !important;
  color: white !important;
  font-size: 1.1rem !important;
  font-weight: 500 !important;
  letter-spacing: 0.5px !important;
  text-transform: none !important;
  border-radius: 12px !important;
  box-shadow: 0 4px 12px rgba(33,150,243,0.3) !important;
  transition: transform 0.2s, box-shadow 0.2s !important;
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(33,150,243,0.4) !important;
}

.security-notice {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 32px;
  color: #666;
  font-size: 0.9rem;
}

.error-alert {
  border-radius: 12px;
  animation: shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes shake {
  10%, 90% { transform: translateX(-1px); }
  20%, 80% { transform: translateX(2px); }
  30%, 50%, 70% { transform: translateX(-4px); }
  40%, 60% { transform: translateX(4px); }
}

.fade-stagger-enter-active, .fade-stagger-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.fade-stagger-enter-from, .fade-stagger-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* Responsive Design */
@media (max-width: 1200px) {
  .left-panel {
    padding: 32px;
  }
  
  .right-panel {
    padding: 32px;
  }
}

@media (max-width: 960px) {
  .login-wrapper {
    flex-direction: column;
  }
  
  .left-panel {
    min-height: 400px;
    min-width: unset;
  }
  
  .right-panel {
    min-width: unset;
  }
  
  .form-container {
    padding: 24px;
  }
}
</style>