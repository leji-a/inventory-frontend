// src/stores/utils/rehydration.ts
import { nextTick } from 'vue'

/**
 * Ensures Pinia stores have finished rehydrating
 * from persisted localStorage before app initialization.
 */
export async function waitForRehydration() {
  await nextTick()
}
