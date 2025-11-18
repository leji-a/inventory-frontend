// src/stores/periods.ts
import { defineStore } from 'pinia'
import { PeriodAPI } from '../api/endpoints/periods'
import type { InventoryPeriod, CreatePeriodInput } from '../api/types'
import { useAuthStore } from './auth'

interface PeriodsState {
  allPeriods: InventoryPeriod[]
  activePeriod: InventoryPeriod | null
  loading: boolean
  error: string | null
}

export const usePeriodsStore = defineStore('periods', {
  state: (): PeriodsState => ({
    allPeriods: [],
    activePeriod: null,
    loading: false,
    error: null,
  }),

  persist: true,

  actions: {
    async fetchActive() {
      const auth = useAuthStore()
      if (!auth.token) {
        this.error = 'Not authenticated'
        return
      }
      this.loading = true
      this.error = null
      try {
        const res = await PeriodAPI.active(auth.token)
        this.activePeriod = res ?? null
      } catch (err: any) {
        this.error = err.message ?? String(err)
      } finally {
        this.loading = false
      }
    },

    async fetchAll() {
      const auth = useAuthStore()
      if (!auth.token) {
        this.error = 'Not authenticated'
        return
      }
      this.loading = true
      this.error = null
      try {
        const res = await PeriodAPI.all(auth.token)
        this.allPeriods = res ?? []
      } catch (err: any) {
        this.error = err.message ?? String(err)
      } finally {
        this.loading = false
      }
    },

    async create(data: CreatePeriodInput) {
      const auth = useAuthStore()
      if (!auth.token) throw new Error('Not authenticated')
      const p = await PeriodAPI.create(auth.token, data)
      this.allPeriods.push(p)
      if (p) this.activePeriod = p
    },

    async close(id: number) {
      const auth = useAuthStore()
      if (!auth.token) throw new Error('Not authenticated')
      await PeriodAPI.close(auth.token, id)
      if (this.activePeriod?.id === id) this.activePeriod = null
    },
  },
})
