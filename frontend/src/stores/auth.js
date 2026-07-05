import { defineStore } from 'pinia'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    session: null,
    loading: false,
    error: null,
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.session,
    // Assuming you store roles in user_metadata or have a custom claim. For now, simple mock or meta check:
    isAdmin: (state) => state.user?.user_metadata?.role === 'admin',
  },
  
  actions: {
    async initialize() {
      const { data: { session } } = await supabase.auth.getSession()
      this.session = session
      this.user = session?.user || null
      
      supabase.auth.onAuthStateChange((_event, session) => {
        this.session = session
        this.user = session?.user || null
      })
    },

    async register(credentials) {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase.auth.signUp({
          email: credentials.email,
          password: credentials.password,
          options: {
            data: {
              full_name: credentials.name,
              role: 'user'
            }
          }
        })
        
        if (error) throw error
        return data.user
      } catch (err) {
        this.error = err.message || 'Registration failed'
        throw err
      } finally {
        this.loading = false
      }
    },
    
    async loginWithGoogle() {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
        })
        if (error) throw error
        return data
      } catch (err) {
        this.error = err.message || 'Google Login failed'
        throw err
      } finally {
        this.loading = false
      }
    },

    async login(credentials) {
      this.loading = true
      this.error = null
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        })
        
        if (error) throw error
        return data.user
      } catch (err) {
        this.error = err.message || 'Login failed'
        throw err
      } finally {
        this.loading = false
      }
    },
    
    async logout() {
      this.loading = true
      try {
        const { error } = await supabase.auth.signOut()
        if (error) throw error
      } catch (err) {
        this.error = err.message
      } finally {
        this.loading = false
        this.user = null
        this.session = null
      }
    }
  }
})
