// authStore.js
import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchWrapper } from '@/helper'
import router from '@/router'

const baseUrl = window.appConfig.apiUrl

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const returnUrl = ref(null)
  const oauthProvider = ref(localStorage.getItem('oauth_provider') || null)

  function setReturnUrl(url) {
    returnUrl.value = url
  }

  // Gộp chung logic set user
  function setUser(username, token, provider = null) {
    user.value = { username, token }
    localStorage.setItem('user', JSON.stringify(user.value))

    if (provider) {
      oauthProvider.value = provider
      localStorage.setItem('oauth_provider', provider)
    }

    console.log('Logged in as:', username)
  }

  async function login(username, password) {
    const userData = await fetchWrapper.login(`${baseUrl}/v1/auth/token`, {
      username,
      password,
    })
    setUser(userData.username, userData.access_token)
    router.push(returnUrl.value || '/')
  }

  function completeOauthLogin(username, token, provider = 'internal') {
    setUser(username, token, provider)
  }

  async function logout() {
  try {
    // Clear local data first
    user.value = null
    const provider = oauthProvider.value
    oauthProvider.value = null
    localStorage.removeItem('user')
    localStorage.removeItem('oauth_provider')
    sessionStorage.clear()

    console.log('[Logout] Provider:', provider)

    // If logged in via OAuth, logout via Smart Office
    if (provider === 'internal') {
      console.log('[Logout] Opening Smart Office logout in popup')
      
      // Open logout URL in popup - let it redirect wherever Smart Office wants
      const popup = window.open(
        'https://fiisw-cns.myfiinet.com/oauth-service/logout',
        'oauth_logout',
        'width=1,height=1'
      )
      
      // Handle popup blocked
      if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        console.warn('[Logout] Popup blocked, redirecting main window')
        window.location.href = 'https://fiisw-cns.myfiinet.com/oauth-service/logout'
        return
      }
      
      // Close popup and redirect after 3 seconds
      setTimeout(() => {
        if (popup && !popup.closed) {
          popup.close()
          console.log('[Logout] Popup closed')
        }
        // Redirect main window to login page
        router.push('/login')
      }, 500)
      
      return
    }

    console.log('[Logout] Normal logout - redirecting to login page')
    router.push('/login')
    
  } catch (error) {
    console.error('[Logout] Error during logout:', error)
    user.value = null
    oauthProvider.value = null
    localStorage.clear()
    sessionStorage.clear()
    router.push('/login')
  }
}

  return {
    user,
    returnUrl,
    oauthProvider,
    setReturnUrl,
    login,
    completeOauthLogin,
    logout,
  }
})
