<template>
  <div class="auth-container">
    <div class="auth-card">
      <div class="auth-header">
        <h2>{{ activeTab === 'signin' ? 'Welcome Back' : 'Create Account' }}</h2>
        <p class="subtitle">
          {{ activeTab === 'signin' ? 'Sign in to continue your learning journey.' : 'Join us to start mastering new skills.' }}
        </p>
      </div>

      <div class="auth-tabs">
        <button 
          :class="['tab-button', { active: activeTab === 'signin' }]"
          @click="switchTab('signin')"
        >
          Sign In
        </button>
        <button 
          :class="['tab-button', { active: activeTab === 'signup' }]"
          @click="switchTab('signup')"
        >
          Sign Up
        </button>
      </div>

      <form @submit.prevent="handleSubmit" class="auth-form" novalidate>
        
        <Transition name="fade-slide">
          <div v-if="activeTab === 'signup'" class="form-group">
            <label for="name">Full Name</label>
            <input 
              id="name"
              type="text" 
              v-model="formState.name" 
              placeholder="John Doe"
              :class="{ 'has-error': errors.name }"
            />
            <span v-if="errors.name" class="error-text">{{ errors.name }}</span>
          </div>
        </Transition>

        <div class="form-group">
          <label for="email">Email Address</label>
          <input 
            id="email"
            type="email" 
            v-model="formState.email" 
            placeholder="john@example.com"
            :class="{ 'has-error': errors.email }"
          />
          <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="password">Password</label>
          <input 
            id="password"
            type="password" 
            v-model="formState.password" 
            placeholder="••••••••"
            :class="{ 'has-error': errors.password }"
          />
          <span v-if="errors.password" class="error-text">{{ errors.password }}</span>
        </div>

        <div v-if="globalError" class="global-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {{ globalError }}
        </div>

        <button type="submit" class="submit-button" :disabled="isSubmitting">
          <span v-if="!isSubmitting">{{ activeTab === 'signin' ? 'Sign In' : 'Create Account' }}</span>
          <span v-else class="loader"></span>
        </button>

        <div class="relative mt-6 mb-4">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-gray-200"></div>
          </div>
          <div class="relative flex justify-center text-sm">
            <span class="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <button 
          type="button" 
          @click="handleGoogleLogin"
          class="w-full flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <svg class="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google
        </button>
      </form>

      <div class="admin-link-wrapper">
        <button class="admin-link" @click="emit('open-admin-login')">
          Access Admin Portal
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
// Assuming Pinia auth store exists per architecture spec (§5)
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['open-admin-login', 'auth-success'])
const router = useRouter()
const route = useRoute()

// UI State
const activeTab = ref('signin') // 'signin' | 'signup'
const isSubmitting = ref(false)
const globalError = ref('')

// Reactive Auth State Details (Simulated for component isolation)
const token = ref(null)
const userRole = ref('guest')

const formState = reactive({
  name: '',
  email: '',
  password: ''
})

const errors = reactive({
  name: '',
  email: '',
  password: ''
})

const switchTab = (tab) => {
  activeTab.value = tab
  clearErrors()
  globalError.value = ''
  if (tab === 'signin') {
    formState.name = '' // Reset name when switching to signin
  }
}

const clearErrors = () => {
  errors.name = ''
  errors.email = ''
  errors.password = ''
}

const validateForm = () => {
  clearErrors()
  let isValid = true

  if (activeTab.value === 'signup' && !formState.name.trim()) {
    errors.name = 'Full name is required.'
    isValid = false
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!formState.email.trim()) {
    errors.email = 'Email address is required.'
    isValid = false
  } else if (!emailRegex.test(formState.email)) {
    errors.email = 'Please enter a valid email address.'
    isValid = false
  }

  if (!formState.password) {
    errors.password = 'Password is required.'
    isValid = false
  } else if (formState.password.length < 8) {
    errors.password = 'Password must be at least 8 characters long.'
    isValid = false
  }

  return isValid
}

const handleGoogleLogin = async () => {
  globalError.value = ''
  try {
    const authStore = useAuthStore()
    await authStore.loginWithGoogle()
    // Redirects are handled by Supabase OAuth flow itself, 
    // but we can catch errors if the popup/redirect fails immediately
  } catch (error) {
    console.error('Google Auth Error:', error)
    globalError.value = error.message || 'Google login failed. Please try again.'
  }
}

const handleSubmit = async () => {
  if (!validateForm()) return

  isSubmitting.value = true
  globalError.value = ''

  try {
    const authStore = useAuthStore()
    if (activeTab.value === 'signin') {
      await authStore.login({ email: formState.email, password: formState.password })
    } else {
      await authStore.register({ name: formState.name, email: formState.email, password: formState.password })
    }
    
    emit('auth-success', { role: authStore.isAdmin ? 'admin' : 'user' })
    const redirect = route.query.redirect || '/'
    router.push(redirect)

  } catch (error) {
    console.error('Authentication Error:', error)
    globalError.value = error.message || 'Authentication failed. Please check your credentials and try again.'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.auth-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  width: 100%;
  background-color: #ffffff; /* White background */
  font-family: 'Inter', sans-serif;
  padding: 1rem;
  box-sizing: border-box;
}

.auth-card {
  width: 100%;
  max-width: 440px;
  background-color: #121824; /* Solid dark navy blue from image */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  color: #f8fafc;
  overflow: hidden;
  transition: all 0.3s ease;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.auth-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #f8fafc; /* Slate 50 */
  letter-spacing: -0.025em;
}

.auth-header .subtitle {
  font-size: 0.95rem;
  color: #94a3b8; /* Slate 400 */
  margin: 0;
  line-height: 1.5;
}

.auth-tabs {
  display: flex;
  background: rgba(15, 23, 42, 0.6); /* Slate 900 */
  border-radius: 12px;
  padding: 0.35rem;
  margin-bottom: 2rem;
  position: relative;
}

.tab-button {
  flex: 1;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 0.95rem;
  font-weight: 600;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1;
  font-family: inherit;
}

.tab-button:hover {
  color: #cbd5e1;
}

.tab-button.active {
  color: #ffffff;
  background: #334155; /* Slate 700 */
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #cbd5e1; /* Slate 300 */
  margin-left: 0.25rem;
}

.form-group input {
  width: 100%;
  background: #0f172a; /* Slate 900 */
  border: 1px solid #334155; /* Slate 700 */
  border-radius: 10px;
  padding: 0.875rem 1rem;
  color: #f8fafc;
  font-size: 1rem;
  font-family: inherit;
  transition: all 0.2s ease;
  box-sizing: border-box;
}

.form-group input:focus {
  outline: none;
  border-color: #f97316; /* Orange 500 */
  box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.2);
}

.form-group input::placeholder {
  color: #475569; /* Slate 600 */
}

.form-group input.has-error {
  border-color: #ef4444; /* Red 500 */
  box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

.error-text {
  color: #ef4444;
  font-size: 0.8rem;
  font-weight: 500;
  margin-left: 0.25rem;
}

.global-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(239, 68, 68, 0.1);
  border-left: 4px solid #ef4444;
  color: #fca5a5;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  margin-top: 0.5rem;
}

.submit-button {
  width: 100%;
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); /* Orange 500 to 600 */
  color: white;
  border: none;
  border-radius: 10px;
  padding: 1rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 52px;
  font-family: inherit;
  box-shadow: 0 4px 14px 0 rgba(234, 88, 12, 0.39);
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(234, 88, 12, 0.5);
  background: linear-gradient(135deg, #fb923c 0%, #f97316 100%);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.loader {
  width: 20px;
  height: 20px;
  border: 3px solid rgba(255,255,255,0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

.admin-link-wrapper {
  margin-top: 2rem;
  text-align: center;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 1.5rem;
}

.admin-link {
  background: transparent;
  border: none;
  color: #64748b; /* Slate 500 */
  font-size: 0.85rem;
  cursor: pointer;
  transition: color 0.2s ease;
  font-family: inherit;
}

.admin-link:hover {
  color: #94a3b8;
  text-decoration: underline;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Animations for form transitions */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 100px;
  opacity: 1;
  overflow: hidden;
}

.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  margin-bottom: 0;
  transform: translateY(-10px);
}
</style>
