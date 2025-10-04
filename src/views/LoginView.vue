<!-- LoginView.vue -->
<template>
    <div
        class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 text-gray-200 flex items-center justify-center p-4">
        <div class="w-full max-w-4xl mx-auto bg-gray-800/60 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 overflow-hidden flex flex-col md:flex-row md:items-stretch"
            role="main">
            <div
                class="flex-shrink-0 md:w-1/3 lg:w-2/5 flex flex-col justify-center text-center md:text-left p-8 md:p-10 lg:p-12">
                <div class="flex flex-col gap-y-2">
                    <span
                        class="block text-4xl lg:text-5xl font-extrabold text-white tracking-tight drop-shadow-lg text-center">
                        FAI
                    </span>
                    <span
                        class="text-center block text-base lg:text-lg font-medium text-blue-200 uppercase tracking-wider mt-1">
                        Smart Security System
                    </span>
                </div>
            </div>

            <div class="w-full md:w-2/3 lg:w-3/5 p-8 md:p-10 lg:p-12 md:border-l md:border-white/10">
                <h2 class="text-2xl font-semibold mb-6 text-center text-blue-200">System Login</h2>

                <form @submit.prevent="handleLogin" class="space-y-6">
                    <div v-if="error"
                        class="p-3 bg-red-900/40 text-red-300 border border-red-700 rounded-md text-sm transition-opacity duration-300"
                        role="alert">
                        {{ error }}
                    </div>

                    <div>
                        <label for="username" class="block text-sm font-medium text-blue-300 mb-1">Username</label>
                        <input type="text" id="username" v-model="username" required :disabled="isLoading"
                            placeholder="Enter your username" autocomplete="username"
                            class="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:opacity-70" />
                    </div>

                    <div>
                        <label for="password" class="block text-sm font-medium text-blue-300 mb-1">Password</label>
                        <div class="relative">
                            <input :type="isPasswordVisible ? 'text' : 'password'" id="password" v-model="password"
                                required :disabled="isLoading" placeholder="Enter your password"
                                autocomplete="current-password"
                                class="w-full pl-4 pr-10 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 disabled:opacity-70" />
                            <button type="button" @click="togglePasswordVisibility"
                                :aria-label="isPasswordVisible ? 'Hide password' : 'Show password'"
                                :title="isPasswordVisible ? 'Hide password' : 'Show password'"
                                class="absolute inset-y-0 right-0 px-3 flex items-center text-gray-400 hover:text-gray-200 transition-colors duration-200 focus:outline-none"
                                :disabled="isLoading">
                                <svg v-if="!isPasswordVisible" xmlns="http://www.w3.org/2000/svg" fill="none"
                                    viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                    stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
                                    <path stroke-linecap="round" stroke-linejoin="round"
                                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    <div>
                        <button type="submit" :disabled="isLoading"
                            class="w-full py-3 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold transition duration-200 ease-in-out shadow-md disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 cursor-pointer">
                            <span v-if="isLoading">
                                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline"
                                    xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor"
                                        stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor"
                                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                                    </path>
                                </svg>
                                Logging In...
                            </span>
                            <span v-else>Login</span>
                        </button>
                    </div>
                </form>

                <!-- OAuth Buttons -->
                <div class="mt-6 pt-6 border-t border-white/10 space-y-3">
                    <!-- GitHub Login -->
                    <button
                        @click="handleOAuthLogin('github')"
                        class="w-full flex items-center justify-center py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-semibold transition duration-200 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800 cursor-pointer"
                        :disabled="isLoading">
                        <svg class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                        </svg>
                        Login with GitHub
                    </button>

                    <!-- Internal SSO Login (Example) -->
                    <!-- Uncomment khi cần -->
                    <!-- <button
                        @click="handleOAuthLogin('internal_sso')"
                        class="w-full flex items-center justify-center py-3 px-4 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg font-semibold transition duration-200 ease-in-out shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 cursor-pointer"
                        :disabled="isLoading">
                        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"/>
                        </svg>
                        Login with Internal SSO
                    </button> -->
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useRoute, useRouter } from 'vue-router'

const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref(null)
const isPasswordVisible = ref(false)

const baseUrl = window.appConfig.apiUrl

// OAuth Provider Configurations
const OAUTH_CONFIGS = {
  github: {
    clientId: 'Ov23lipbkAa7YQYhp0eX',  // Hoặc lấy từ env
    authUrl: 'https://github.com/login/oauth/authorize',
    redirectUri: `${window.location.origin}${window.location.pathname}#/auth`,
    scope: 'user'
  },
  internal_sso: {
    clientId: 'YOUR_INTERNAL_SSO_CLIENT_ID',
    authUrl: 'http://sso.internal.com/oauth/authorize',
    redirectUri: `${window.location.origin}${window.location.pathname}#/auth`,
    scope: 'profile email'
  }
}

onMounted(async () => {
  // Set returnUrl từ query nếu có
  if (route.query.returnUrl) {
    authStore.setReturnUrl(route.query.returnUrl)
  }
})

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
    error.value = err.message || 'Login failed. Please check your credentials.'
  } finally {
    isLoading.value = false
  }
}

const handleOAuthLogin = (provider) => {
  if (isLoading.value) return
  
  const config = OAUTH_CONFIGS[provider]
  if (!config) {
    error.value = `Unsupported OAuth provider: ${provider}`
    return
  }

  try {
    // 1. Generate random state
    const state = generateRandomState()
    
    // 2. Save state và provider vào sessionStorage
    sessionStorage.setItem('oauth_state', state)
    sessionStorage.setItem('oauth_provider', provider)
    
    // 3. Save returnUrl
    if (authStore.returnUrl) {
      sessionStorage.setItem('oauth_return_url', authStore.returnUrl)
    }
    
    // 4. Build authorization URL
    const params = new URLSearchParams({
      client_id: config.clientId,
      redirect_uri: config.redirectUri,
      scope: config.scope,
      state: state,
      response_type: 'code'
    })
    
    const authUrl = `${config.authUrl}?${params.toString()}`
    
    // 5. Redirect to OAuth provider
    window.location.href = authUrl
    
  } catch (err) {
    console.error(`${provider} login failed:`, err)
    error.value = `Failed to initiate ${provider} login`
  }
}

// Utility function to generate random state
function generateRandomState() {
  const array = new Uint8Array(16)
  crypto.getRandomValues(array)
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
}
</script>