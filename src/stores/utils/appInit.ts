import { useAuthStore } from '../../stores/auth'
import { usePeriodsStore } from '../../stores/periods'
import { useProductsStore } from '../../stores/products'
import { useRecordsStore } from '../../stores/records'
import { useCategoriesStore } from '../categories'

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
  const categories = useCategoriesStore()

  await Promise.allSettled([
    categories.fetchAll(),
    periods.fetchActive(),
    products.fetchAll(),
    records.fetchByPeriod(periods.activePeriod?.id ?? 0),
  ])
}
