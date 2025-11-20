// src/api/endpoints/records.ts
import { apiFetch } from '../index'
import type { InventoryRecord } from '../types'

export const RecordAPI = {
  listByPeriod: (token: string, periodId: number) =>
    apiFetch<InventoryRecord[]>(
      `/inventory/periods/${periodId}/records`,
      token
    ),

  upsert: (
    token: string,
    periodId: number,
    body: { product_id: number; quantity: number; notes?: string }
  ) =>
    apiFetch<InventoryRecord>(`/inventory/periods/${periodId}/records`, token, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  current: (token: string) =>
    apiFetch<{ period: any | null; records: InventoryRecord[] }>(
      '/inventory/current',
      token
    ),

  delete: (token: string, periodId: number, productId: number) =>
  apiFetch(
    `/inventory/periods/${periodId}/records/${productId}`,
    token,
    { method: 'DELETE' }
  ),

}
