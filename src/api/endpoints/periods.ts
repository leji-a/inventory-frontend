// src/api/periods.ts
import { apiFetch } from '../index'
import type { InventoryPeriod, CreatePeriodInput, UpdatePeriodInput } from '../types'

export const PeriodAPI = {
  all: (token: string) =>
    apiFetch<InventoryPeriod[]>('/inventory/periods', token),

  active: (token: string) =>
    apiFetch<InventoryPeriod | null>('/inventory/periods/active', token),

  create: (token: string, body: CreatePeriodInput) =>
    apiFetch<InventoryPeriod>('/inventory/periods', token, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  update: (token: string, id: number, body: UpdatePeriodInput) =>
    apiFetch<InventoryPeriod>(`/inventory/periods/${id}`, token, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  delete: (token: string, id: number) =>
    apiFetch<void>(`/inventory/periods/${id}`, token, {
      method: 'DELETE',
    }),

  close: (token: string, id: number) =>
    apiFetch(`/inventory/periods/${id}/close`, token, { method: 'POST' }),
}