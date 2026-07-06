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
             <router-link v-if="!authStore.isAuthenticated" :to="{ name: 'AuthScreen' }" class="hidden sm:inline-block text-sm font-medium text-slate-600 hover:text-slate-900">
               Login
             </router-link>
             <button v-else @click="handleLogout" class="hidden sm:inline-block text-sm font-medium text-red-500 hover:text-red-700">
               Logout
             </button>
             <span class="hidden sm:inline-block text-gray-300">|</span>
             <router-link :to="{ name: 'AdminLogin' }" class="hidden sm:inline-block text-xs text-gray-400 hover:text-gray-600">Admin Portal</router-link>
             
             <!-- Mobile menu button -->
             <div class="flex items-center sm:hidden">
               <button @click="isMobileMenuOpen = !isMobileMenuOpen" class="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-slate-500 rounded-md p-2">
                 <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path v-if="!isMobileMenuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                   <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                 </svg>
               </button>
             </div>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      <div v-show="isMobileMenuOpen" class="sm:hidden border-t border-gray-200 bg-white">
        <div class="pt-2 pb-3 space-y-1">
          <router-link @click="isMobileMenuOpen = false" :to="{ name: 'Home' }" class="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-slate-50 hover:text-slate-900" active-class="bg-slate-50 text-slate-900 border-l-4 border-slate-800">
            Home
          </router-link>
          <router-link @click="isMobileMenuOpen = false" :to="{ name: 'AskQuestion' }" class="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-slate-50 hover:text-slate-900" active-class="bg-slate-50 text-slate-900 border-l-4 border-slate-800">
            Ask Question
          </router-link>
          <router-link @click="isMobileMenuOpen = false" :to="{ name: 'QuestionHistory' }" class="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-slate-50 hover:text-slate-900" active-class="bg-slate-50 text-slate-900 border-l-4 border-slate-800">
            History
          </router-link>
          <router-link @click="isMobileMenuOpen = false" :to="{ name: 'Flashcards' }" class="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-slate-50 hover:text-slate-900" active-class="bg-slate-50 text-slate-900 border-l-4 border-slate-800">
            Flashcards
          </router-link>
          <router-link @click="isMobileMenuOpen = false" :to="{ name: 'GlobalQuiz' }" class="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-slate-50 hover:text-slate-900" active-class="bg-slate-50 text-slate-900 border-l-4 border-slate-800">
            Global Quiz
          </router-link>
          <router-link @click="isMobileMenuOpen = false" :to="{ name: 'About' }" class="block px-4 py-2 text-base font-medium text-gray-700 hover:bg-slate-50 hover:text-slate-900" active-class="bg-slate-50 text-slate-900 border-l-4 border-slate-800">
            About
          </router-link>
        </div>
        <div class="pt-4 pb-3 border-t border-gray-200">
          <div class="px-4 space-y-1">
             <router-link @click="isMobileMenuOpen = false" v-if="!authStore.isAuthenticated" :to="{ name: 'AuthScreen' }" class="block px-4 py-2 text-base font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900">
               Login
             </router-link>
             <button v-else @click="() => { isMobileMenuOpen = false; handleLogout(); }" class="block w-full text-left px-4 py-2 text-base font-medium text-red-500 hover:bg-slate-50 hover:text-red-700">
               Logout
             </button>
             <router-link @click="isMobileMenuOpen = false" :to="{ name: 'AdminLogin' }" class="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-slate-50 hover:text-gray-700">
               Admin Portal
             </router-link>
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
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isMobileMenuOpen = ref(false)

// Check if current route is an admin route
const isAdminRoute = computed(() => {
  return route.path.startsWith('/admin')
})

const handleLogout = async () => {
  await authStore.logout()
  router.push('/login')
}
</script>
