import { handleError, ref } from 'vue'
import { defineStore } from 'pinia'

import { fetchWrapper } from '@/helper'
import router from '@/router'

const baseUrl = window.appConfig.apiUrl

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(localStorage.getItem('user')) || null)
  const returnUrl = ref(null)
  async function login(username, password) {
    const userData = await fetchWrapper.login(`${baseUrl}/v1/auth/token`, {
      username: username,
      password: password,
    })

    // update pinia state
    user.value = { user: userData.user, token: userData.access_token }

    // store user details and jwt in local storage to keep user logged in between page refreshes
    localStorage.setItem('user', JSON.stringify(user.value))

    // redirect to previous url or default to home page
    router.push(returnUrl.value || '/')
  }
  function logout() {
    user.value = null
    localStorage.removeItem('user')
    router.push('/login')
  }
  return { user, returnUrl, login, logout }
})
