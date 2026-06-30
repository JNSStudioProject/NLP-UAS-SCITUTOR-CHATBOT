import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/', name: 'Home', component: () => import('../components/User/Home.vue') },
  { path: '/ask', name: 'AskQuestion', component: () => import('../components/User/AskQuestion.vue') },
  { path: '/about', name: 'About', component: () => import('../components/User/About.vue') },
  {
    path: '/history',
    name: 'QuestionHistory',
    component: () => import('../components/User/QuestionHistory.vue'),
    meta: { requiresAuth: true }
  },
  { path: '/login', name: 'AuthScreen', component: () => import('../components/Auth/AuthScreen.vue') },
  { path: '/admin/login', name: 'AdminLogin', component: () => import('../components/Auth/AdminLogin.vue') },
  {
    path: '/admin/dashboard',
    name: 'Dashboard',
    component: () => import('../components/Admin/Dashboard.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/dataset',
    name: 'DatasetManagement',
    component: () => import('../components/Admin/DatasetManagement.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/model',
    name: 'ModelInformation',
    component: () => import('../components/Admin/ModelInformation.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/monitoring',
    name: 'QuestionMonitoring',
    component: () => import('../components/Admin/QuestionMonitoring.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation Guards
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // If the route is an admin route, redirect to admin login
    if (to.path.startsWith('/admin')) {
      return next({ name: 'AdminLogin', query: { redirect: to.fullPath } })
    }
    // Otherwise standard login
    return next({ name: 'AuthScreen', query: { redirect: to.fullPath } })
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next({ name: 'Home' }) // Redirect unauthorized access to home
  }

  next()
})

export default router
