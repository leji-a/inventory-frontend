// src/stores/records.ts
import { defineStore } from 'pinia'
import { RecordAPI } from '../api/endpoints/records'
import type { InventoryRecord } from '../api/types'
import { useAuthStore } from './auth'

interface RecordsState {
  byPeriod: Record<number, InventoryRecord[]>
  loading: boolean
  error: string | null
}

export const useRecordsStore = defineStore('records', {
  state: (): RecordsState => ({
    byPeriod: {},
    loading: false,
    error: null,
  }),

  // persist last known records (optional)
  persist: true,

  actions: {
    async fetchByPeriod(periodId: number) {
      const auth = useAuthStore()
      if (!auth.token) {
        this.error = 'Not authenticated'
        return
      }

      this.loading = true
      this.error = null
      try {
        const res = await RecordAPI.listByPeriod(auth.token, periodId)
        // res: { data: InventoryRecord[] }
        this.byPeriod[periodId] = res.data ?? []
      } catch (err: any) {
        this.error = err.message ?? String(err)
      } finally {
        this.loading = false
      }
    },

    async upsert(periodId: number, productId: number, quantity: number, notes?: string) {
      const auth = useAuthStore()
      if (!auth.token) throw new Error('Not authenticated')

      const rec = await RecordAPI.upsert(auth.token, periodId, {
        product_id: productId,
        quantity,
        notes,
      })

      const existing = this.byPeriod[periodId] || []
      const i = existing.findIndex(r => r.product_id === productId)
      if (i >= 0) existing[i] = rec
      else existing.push(rec)
      this.byPeriod[periodId] = [...existing]
    },
  },
})
