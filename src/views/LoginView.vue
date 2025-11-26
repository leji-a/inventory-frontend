<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import ErrorMessage from '../components/ErrorMessage.vue'

const email = ref('')
const password = ref('')
const auth = useAuthStore()
const router = useRouter()
const showPassword = ref(false)

const error = ref('')
const loading = ref(false)
const errors = ref({ email: "", password: "" })

async function handleLogin() {
  error.value = ""
  errors.value = { email: "", password: "" }

  if (!email.value) errors.value.email = "Email is required."
  if (!password.value) errors.value.password = "Password is required."
  if (errors.value.email || errors.value.password) return

  loading.value = true
  try {
    await auth.login(email.value, password.value)
    router.push('/')
  } catch (err: any) {
    error.value = err.message || "Error al iniciar sesión"
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="auth-wrapper">
    <div class="auth-card">
      <h1 class="auth-title">Bienvenido</h1>

      <form @submit.prevent="handleLogin" class="auth-form">
        
        <!-- Email -->
        <div class="field">
          <input 
            v-model="email" 
            type="email" 
            placeholder="Email" 
            class="auth-input" 
          />
          <ErrorMessage :message="errors.email" />
        </div>

        <!-- Password -->
        <div class="field password-field">
          <div class="password-wrapper">
            <input
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Contraseña"
              class="auth-input"
            />

            <button 
              type="button" 
              class="toggle-btn" 
              @click="showPassword = !showPassword" 
              aria-label="Toggle password visibility"
            >
              <!-- ojo cerrado -->
              <svg 
                v-if="!showPassword"
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20"
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2"
                stroke-linecap="round" 
                stroke-linejoin="round"
              >
                <path d="M1 12S5 5 12 5s11 7 11 7-4 7-11 7S1 12 1 12z"></path>
                <circle cx="12" cy="12" r="3"></circle>
                <line x1="4" y1="4" x2="20" y2="20"></line>
              </svg>

              <!-- ojo abierto -->
              <svg 
                v-else 
                xmlns="http://www.w3.org/2000/svg" 
                width="20" 
                height="20"
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="2"
                stroke-linecap="round" 
                stroke-linejoin="round"
                aria-hidden="true" 
                focusable="false"
              >
                <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
            </button>
          </div>

          <ErrorMessage :message="errors.password" />
        </div>

        <ErrorMessage :message="error" />

        <button class="auth-button" :disabled="loading">
          {{ loading ? "..." : "Ingresar" }}
        </button>
      </form>

      <router-link to="/signup" class="auth-link">
        Crear cuenta
      </router-link>
    </div>
  </div>
</template>


<style scoped>
.auth-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
}

.auth-card {
  width: 100%;
  max-width: 360px;
  background: #181818;
  padding: 2.5rem;
  border-radius: 12px;
  border: 1px solid #2a2a2a;
}

.auth-title {
  margin-bottom: 2rem;
  font-size: 1.8rem;
  font-weight: 600;
  text-align: center;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.auth-input {
  padding: 0.75rem 1rem;
  background: #111;
  color: #eee;
  border: 1px solid #333;
  border-radius: 8px;
  font-size: 1rem;
  transition: border 0.2s;
}

.auth-input:focus {
  outline: none;
  border-color: #646cff;
}

.auth-button {
  padding: 0.75rem;
  background: #646cff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s;
}

.auth-button:disabled {
  opacity: 0.6;
  cursor: default;
}

.auth-link {
  margin-top: 1.2rem;
  color: #8aa0ff;
  text-align: center;
  display: block;
  font-size: 0.9rem;
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.toggle-btn {
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  padding: 0;
  color: #aaa;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.toggle-btn:hover {
  color: #fff;
}

.toggle-btn svg {
  display: block;
}
</style>