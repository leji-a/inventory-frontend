import { defineStore } from 'pinia'
import { AuthAPI } from '../api/endpoints/auth'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as any,
    token: null as string | null,
    loading: false,
    error: '',
  }),

  persist: true,

  actions: {
    async login(email: string, password: string) {
      this.loading = true
      this.error = ''
      try {
        const { user, session } = await AuthAPI.login(email, password)
        this.user = user
        this.token = session?.access_token ?? null
      } catch (err: any) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async signup(email: string, password: string) {
      this.loading = true
      this.error = ''
      try {
        const { user, session } = await AuthAPI.signup(email, password)
        this.user = user
        this.token = session?.access_token ?? null
      } catch (err: any) {
        this.error = err.message
        throw err
      } finally {
        this.loading = false
      }
    },

    async signOut() {
      await AuthAPI.logout()
      this.user = null
      this.token = null
    },

    async rehydrate() {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (session) {
        this.user = session.user
        this.token = session.access_token
      }
    },
  },
})
