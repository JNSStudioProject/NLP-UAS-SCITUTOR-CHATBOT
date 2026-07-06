<template>
  <div class="min-h-screen flex flex-col bg-slate-50">
    <!-- Global User Navbar -->
    <nav v-if="!isAdminRoute" class="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex">
            <div class="flex-shrink-0 flex items-center cursor-pointer" @click="$router.push({ name: 'Home' })">
              <span class="text-2xl mr-2">🧠</span>
              <span class="font-bold text-slate-800 text-lg">SciTutor</span>
            </div>
            <div class="hidden sm:ml-8 sm:flex sm:space-x-8">
              <router-link :to="{ name: 'Home' }" class="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-slate-300 text-sm font-medium text-gray-500 hover:text-gray-700" active-class="border-slate-800 text-slate-900">
                Home
              </router-link>
              <router-link :to="{ name: 'AskQuestion' }" class="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-slate-300 text-sm font-medium text-gray-500 hover:text-gray-700" active-class="border-slate-800 text-slate-900">
                Ask Question
              </router-link>
              <router-link :to="{ name: 'QuestionHistory' }" class="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-slate-300 text-sm font-medium text-gray-500 hover:text-gray-700" active-class="border-slate-800 text-slate-900">
                History
              </router-link>
              <router-link :to="{ name: 'Flashcards' }" class="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-slate-300 text-sm font-medium text-gray-500 hover:text-gray-700" active-class="border-slate-800 text-slate-900">
                Flashcards
              </router-link>
              <router-link :to="{ name: 'GlobalQuiz' }" class="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-slate-300 text-sm font-medium text-gray-500 hover:text-gray-700" active-class="border-slate-800 text-slate-900">
                Global Quiz
              </router-link>
              <router-link :to="{ name: 'About' }" class="inline-flex items-center px-1 pt-1 border-b-2 border-transparent hover:border-slate-300 text-sm font-medium text-gray-500 hover:text-gray-700" active-class="border-slate-800 text-slate-900">
                About
              </router-link>
            </div>
          </div>
          <div class="flex items-center space-x-4">
             <router-link v-if="!authStore.isAuthenticated" :to="{ name: 'AuthScreen' }" class="text-sm font-medium text-slate-600 hover:text-slate-900">
               Login
             </router-link>
             <button v-else @click="handleLogout" class="text-sm font-medium text-red-500 hover:text-red-700">
               Logout
             </button>
             <span class="text-gray-300">|</span>
             <router-link :to="{ name: 'AdminLogin' }" class="text-xs text-gray-400 hover:text-gray-600">Admin Portal</router-link>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-grow">
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

// Check if current route is an admin route
const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin')
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
