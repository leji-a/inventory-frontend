import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'
import SignupView from '../views/SignUpView.vue'
import DashboardView from '../views/DashboardView.vue'
import CategoriesView from '../views/CategoriesView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: DashboardView, meta: { requiresAuth: true } },
    { path: '/login', component: LoginView },
    { path: '/signup', component: SignupView },
    { path: '/categories', component: CategoriesView },
  ],
})

router.beforeEach(async (to, _from, next) => {
  const auth = useAuthStore()
  await auth.rehydrate()

  if (to.meta.requiresAuth && !auth.token) next('/login')
  else if ((to.path === '/login' || to.path === '/signup') && auth.token)
    next('/')
  else next()
})

export default router
