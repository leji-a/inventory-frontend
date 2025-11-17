import { apiFetch } from '../index'
import type { InventoryRecord } from '../types'

export const RecordAPI = {
  listByPeriod: (token: string, periodId: number) =>
    apiFetch<{ data: InventoryRecord[] }>(
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
    apiFetch<{ data: InventoryRecord[] }>('/inventory/current', token),
}
