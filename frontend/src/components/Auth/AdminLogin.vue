<template>
  <div class="auth-container relative">
    <div class="auth-card">
      <div class="auth-header">
        <div class="admin-badge">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h2>System Administration</h2>
        <p class="subtitle">Secure portal access for authorized personnel only.</p>
      </div>

      <form @submit.prevent="handleAdminLogin" class="auth-form" novalidate>
        
        <div class="form-group">
          <label for="admin-email">Administrator Email</label>
          <input 
            id="admin-email"
            type="email" 
            v-model="formState.email" 
            placeholder="admin@scitutor.internal"
            :disabled="isLockedOut || isSubmitting"
            :class="{ 'has-error': errors.email }"
          />
          <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
        </div>

        <div class="form-group">
          <label for="admin-key">Master Key</label>
          <input 
            id="admin-key"
            type="password" 
            v-model="formState.adminKey" 
            placeholder="••••••••••••••••"
            :disabled="isLockedOut || isSubmitting"
            :class="{ 'has-error': errors.adminKey }"
          />
          <span v-if="errors.adminKey" class="error-text">{{ errors.adminKey }}</span>
        </div>

        <div v-if="globalError" class="global-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          {{ globalError }}
        </div>

        <div v-if="isLockedOut" class="lockout-warning">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          Too many failed attempts. Try again in {{ formattedLockoutTime }}.
        </div>

        <button 
          type="submit" 
          class="submit-button" 
          :disabled="isSubmitting || isLockedOut"
        >
          <span v-if="!isSubmitting">Authenticate</span>
          <span v-else class="loader"></span>
        </button>
      </form>

      <div class="admin-link-wrapper">
        <button type="button" class="admin-link" @click="router.push('/')">
          ← Back to Home
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const emit = defineEmits(['back-to-user', 'auth-success'])
const router = useRouter()

const isSubmitting = ref(false)
const globalError = ref('')
const lockoutTimer = ref(null)
const loginAttempts = ref(0)

const formState = reactive({
  email: '',
  adminKey: '',
  lockoutSeconds: 0
})

const errors = reactive({
  email: '',
  adminKey: ''
})

const isLockedOut = computed(() => formState.lockoutSeconds > 0)

const formattedLockoutTime = computed(() => {
  const m = Math.floor(formState.lockoutSeconds / 60)
  const s = formState.lockoutSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
})

const clearErrors = () => {
  errors.email = ''
  errors.adminKey = ''
  globalError.value = ''
}

const triggerLockout = () => {
  formState.lockoutSeconds = 300
  globalError.value = 'Account locked due to consecutive failures.'
  
  if (lockoutTimer.value) clearInterval(lockoutTimer.value)
  
  lockoutTimer.value = setInterval(() => {
    formState.lockoutSeconds--
    if (formState.lockoutSeconds <= 0) {
      clearInterval(lockoutTimer.value)
      formState.lockoutSeconds = 0
      globalError.value = ''
    }
  }, 1000)
}

const handleFailedAttempt = () => {
  loginAttempts.value++
  if (loginAttempts.value >= 5) {
    triggerLockout()
  }
}

onUnmounted(() => {
  if (lockoutTimer.value) clearInterval(lockoutTimer.value)
})

const validateForm = () => {
  clearErrors()
  let isValid = true

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!formState.email.trim()) {
    errors.email = 'Administrator email is required.'
    isValid = false
  } else if (!emailRegex.test(formState.email)) {
    errors.email = 'Invalid email format.'
    isValid = false
  }

  if (!formState.adminKey.trim()) {
    errors.adminKey = 'Master Key is required.'
    isValid = false
  }

  return isValid
}

const handleAdminLogin = async () => {
  if (isLockedOut.value) return
  if (!validateForm()) return

  isSubmitting.value = true
  
  try {
    const authStore = useAuthStore()
    await authStore.login({ email: formState.email, password: formState.adminKey })

    if (!authStore.isAdmin) {
       authStore.logout()
       throw new Error('Unauthorized: Admin access required.')
    }

    loginAttempts.value = 0
    emit('auth-success', { role: 'admin' })
    router.push('/admin/dashboard')

  } catch (error) {
    console.error('Admin Auth Error:', error)
    globalError.value = error.message || 'Invalid administrator credentials. This incident will be logged.'
    handleFailedAttempt()
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
  background-color: #ffffff; /* White background matching AuthScreen */
  font-family: 'Inter', sans-serif;
  padding: 1rem;
  box-sizing: border-box;
}

.auth-card {
  width: 100%;
  max-width: 440px;
  background-color: #121824; /* Solid dark navy blue matching AuthScreen */
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 2.5rem;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
  color: #f8fafc;
  overflow: hidden;
  transition: all 0.3s ease;
  position: relative;
}

.auth-header {
  text-align: center;
  margin-bottom: 2rem;
}

.admin-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  background: rgba(249, 115, 22, 0.15); /* Orange tinted background */
  color: #f97316; /* Orange 500 */
  border-radius: 12px;
  margin-bottom: 1rem;
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

.form-group input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #0f172a;
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

.lockout-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(245, 158, 11, 0.1);
  border-left: 4px solid #f59e0b;
  color: #fcd34d;
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
</style>
