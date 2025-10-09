<!-- OAuthCallback.vue -->
<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-800 flex items-center justify-center">
    <div class="bg-gray-800/60 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 p-8 max-w-md w-full">
      <div class="text-center">
        <div v-if="isProcessing" class="space-y-4">
          <svg class="animate-spin h-12 w-12 text-blue-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-blue-300 text-lg font-medium">Authenticating...</p>
          <p class="text-gray-400 text-sm">Please wait while we complete your login</p>
        </div>

        <div v-if="error" class="space-y-4">
          <svg class="h-12 w-12 text-red-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <p class="text-red-300 text-lg font-medium">Authentication Failed</p>
          <p class="text-red-200 text-lg font-lg">Some config is wrong!</p>
          <p class="text-gray-400 text-sm">{{ error }}</p>
          <button
            @click="redirectToLogin"
            class="mt-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg transition duration-200 cursor-pointer"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const isProcessing = ref(true)
const error = ref(null)

const baseUrl = window.appConfig.apiUrl

onMounted(async () => {
  // Debug: Log toàn bộ URL để kiểm tra
  console.log('Full URL:', window.location.href)
  console.log('Hash:', window.location.hash)
  console.log('Route query:', route.query)
  
  await handleOAuthCallback()
})

const handleOAuthCallback = async () => {
  try {
    // ⚙️ STEP 0: Phát hiện và sửa URL sai dạng (/?code=...#/auth)
    const currentUrl = window.location.href
    if (currentUrl.includes('?code=') && currentUrl.includes('#/')) {
      const searchParams = new URLSearchParams(window.location.search)
      const code = searchParams.get('code')
      const state = searchParams.get('state')

      // Nếu có đủ 2 param, redirect sang URL đúng cấu trúc
      if (code && state) {
        const fixedUrl = `http://10.72.216.63:8005/v2/#/auth?code=${code}&state=${state}`
        console.log('Redirecting to fixed OAuth URL:', fixedUrl)
        window.location.replace(fixedUrl)
        return // Dừng xử lý để chờ reload trang
      }
    }

    // 1. Get code and state from URL
    let code = route.query.code
    let state = route.query.state

    // Fallback: Parse từ window.location.search (trước hash)
    if (!code || !state) {
      const searchParams = new URLSearchParams(window.location.search)
      code = searchParams.get('code')
      state = searchParams.get('state')
    }

    // Fallback 2: Parse từ hash (sau #)
    if (!code || !state) {
      const hash = window.location.hash // #/auth?code=xxx&state=yyy
      const queryString = hash.split('?')[1]
      
      if (queryString) {
        const params = new URLSearchParams(queryString)
        code = params.get('code')
        state = params.get('state')
      }
    }

    if (!code || !state) {
      throw new Error('Missing authorization code or state')
    }

    // 2. Verify state
    const savedState = sessionStorage.getItem('oauth_state')
    if (state !== savedState) {
      throw new Error('Invalid state parameter. Possible CSRF attack.')
    }

    // 3. Get provider
    const provider = sessionStorage.getItem('oauth_provider')
    if (!provider) {
      throw new Error('OAuth provider not found')
    }

    // 4. Exchange code for JWT token
    const response = await fetch(`${baseUrl}/v1/auth/oauth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: provider,
        code: code,
        state: state
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Authentication failed')
    }

    const tokenData = await response.json()

    // 5. Complete login in auth store
    authStore.completeOauthLogin(tokenData.username, tokenData.access_token, provider)

    // 6. Cleanup sessionStorage
    sessionStorage.removeItem('oauth_state')
    sessionStorage.removeItem('oauth_provider')
    
    // 7. Clean the URL (remove ?code=...&state=... before #)
    const cleanUrl = window.location.href.split('?')[0]
    window.history.replaceState({}, '', cleanUrl)

    // 8. Redirect user back to the original page
    const returnUrl = sessionStorage.getItem('oauth_return_url') || '/'
    sessionStorage.removeItem('oauth_return_url')

    // Small delay to show success state
    setTimeout(() => {
      router.push(returnUrl)
    }, 200)

  } catch (err) {
    console.error('OAuth callback failed:', err)
    error.value = err.message
    isProcessing.value = false
    
    // Cleanup on error
    sessionStorage.removeItem('oauth_state')
    sessionStorage.removeItem('oauth_provider')
    sessionStorage.removeItem('oauth_return_url')
  }
}

const redirectToLogin = () => {
  router.push('/login')
}
</script>