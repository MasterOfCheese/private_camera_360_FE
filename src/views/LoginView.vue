<template>
  <div
    class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 text-gray-200 flex items-center justify-center p-4"
  >
    <div
      class="w-full max-w-4xl mx-auto bg-gray-800/60 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 overflow-hidden flex flex-col md:flex-row md:items-stretch"
      role="main"
    >
      <div
        class="flex-shrink-0 md:w-1/3 lg:w-2/5 flex flex-col justify-center text-center md:text-left p-8 md:p-10 lg:p-12"
      >
        <div class="flex flex-col gap-y-2">
          <span
            class="block text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg text-center"
          >
            FAI
          </span>
          <span
            class="text-center block text-base lg:text-lg font-medium text-blue-200 uppercase tracking-wider mt-1"
          >
            Smart Security System
          </span>
        </div>

        <!-- <p class="mt-4 text-gray-300 text-sm hidden md:block">
          Centralized monitoring and access control.
        </p> -->
      </div>

      <div class="w-full md:w-2/3 lg:w-3/5 p-8 md:p-10 lg:p-12 md:border-l md:border-white/10">
        <h2 class="text-2xl font-semibold mb-6 text-center text-blue-200">System Login</h2>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div
            v-if="error"
            class="p-3 bg-red-900/40 text-red-300 border border-red-700 rounded-md text-sm transition-opacity duration-300"
            role="alert"
          >
            {{ error }}
          </div>

          <div>
            <label for="username" class="block text-sm font-medium text-blue-300 mb-1"
              >Username</label
            >
            <input
              type="text"
              id="username"
              v-model="username"
              required
              :disabled="isLoading"
              placeholder="Enter your username"
              autocomplete="username"
              class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:opacity-70"
            />
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-blue-300 mb-1"
              >Password</label
            >
            <div class="relative">
              <input
                :type="isPasswordVisible ? 'text' : 'password'"
                id="password"
                v-model="password"
                required
                :disabled="isLoading"
                placeholder="Enter your password"
                autocomplete="current-password"
                class="w-full pl-4 pr-10 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:opacity-70"
              />
              <button
                type="button"
                @click="togglePasswordVisibility"
                :aria-label="isPasswordVisible ? 'Hide password' : 'Show password'"
                :title="isPasswordVisible ? 'Hide password' : 'Show password'"
                class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors duration-200 focus:outline-none"
                :disabled="isLoading"
              >
                <svg
                  v-if="!isPasswordVisible"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                  />
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke-width="1.5"
                  stroke="currentColor"
                  class="w-5 h-5"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              </button>
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="isLoading"
              class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition duration-200 ease-in-out shadow-md disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              <span v-if="isLoading">
                <svg
                  class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    class="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    stroke-width="4"
                  ></circle>
                  <path
                    class="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Logging In...
              </span>
              <span v-else>Login</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore' // Adjust path as needed

const authStore = useAuthStore()

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref(null) // Stores login error messages
const isPasswordVisible = ref(false) // <-- State for visibility

// --- Toggle Password Visibility Function ---
const togglePasswordVisibility = () => {
  isPasswordVisible.value = !isPasswordVisible.value
}
const handleLogin = async () => {
  if (isLoading.value) return

  isLoading.value = true
  error.value = null

  try {
    await authStore.login(username.value, password.value)
  } catch (err) {
    console.error('Login failed:', err)
    error.value = err.message || 'Login failed. Please check your username and password.'
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
/* Specific overrides if needed */
</style>
