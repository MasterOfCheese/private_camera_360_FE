import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchWrapper } from '@/helper'
import router from '@/router'

const baseUrl = window.appConfig.apiUrl

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const returnUrl = ref(null)

  function setReturnUrl(url) {
    returnUrl.value = url
  }

  // Gộp chung logic set user
  function setUser(username, token) {
    user.value = { username, token }
    localStorage.setItem('user', JSON.stringify(user.value))
    console.log('Logged in as:', username)
  }

  async function login(username, password) {
    const userData = await fetchWrapper.login(`${baseUrl}/v1/auth/token`, {
      username,
      password,
    })
    setUser(userData.user, userData.access_token)
    router.push(returnUrl.value || '/')
  }

  function completeOauthLogin(username, token) {
    setUser(username, token)
  }

  function logout() {
    user.value = null
    localStorage.removeItem('user')
    router.push('/login')
  }

  return { user, returnUrl, setReturnUrl, login, completeOauthLogin, logout }
})