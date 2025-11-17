// src/api/auth.ts
import { supabase } from '../../lib/supabase'

export const AuthAPI = {
  async login(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  },

  async signup(email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  },

  async logout() {
    await supabase.auth.signOut()
  },
}
