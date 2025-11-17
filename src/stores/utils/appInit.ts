import { useAuthStore } from '../../stores/auth'
import { usePeriodsStore } from '../../stores/periods'
import { useProductsStore } from '../../stores/products'
import { useRecordsStore } from '../../stores/records'

export async function appInit() {
  const auth = useAuthStore()
  await auth.rehydrate()

  if (!auth.token) {
    console.warn('No auth token found, skipping data fetch.')
    return
  }

  const periods = usePeriodsStore()
  const products = useProductsStore()
  const records = useRecordsStore()

  await Promise.allSettled([
    periods.fetchActive(),
    products.fetchAll(),
    records.fetchByPeriod(periods.activePeriod?.id ?? 0),
  ])
}
