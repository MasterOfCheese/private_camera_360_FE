import { useAuthStore } from '@/stores'
import { useI18n } from 'vue-i18n'

export const fetchWrapper = {
  get: request('GET'),
  post: request('POST'),
  put: request('PUT'),
  delete: request('DELETE'),
  patch: request('PATCH'),
  login: login(),
}

function request(method) {
  return (url, body) => {
    const requestOptions = {
      method,
      headers: authHeader(url),
    }
    if (body) {
      requestOptions.headers['Content-Type'] = 'application/json'
      requestOptions.body = JSON.stringify(body)
    }
    return fetch(url, requestOptions).then(handleResponse)
  }
}

function login() {
  return (url, body) => {
    const formData = new FormData()
    Object.keys(body).forEach((key) => {
      formData.append(key, body[key])
      // console.log(key, body[key])
    })
    return fetch(url, {
      method: 'POST',
      body: formData,
      headers: authHeader(url),
    }).then(handleResponse)
  }
}

// helper functions

function authHeader(url) {
  // return auth header with jwt if user is logged in and request is to the api url
  const { user } = useAuthStore()
  const isLoggedIn = !!user?.token
  const isApiUrl = url.startsWith(window.appConfig.apiUrl)
  if (isLoggedIn && isApiUrl) {
    return { Authorization: `Bearer ${user.token}` }
  } else {
    return {}
  }
}

function handleResponse(response) {
  return response.text().then((text) => {
    const data = text && JSON.parse(text)

    if (!response.ok) {
      const { user } = useAuthStore()
      if (response.status === 403) {
        return Promise.reject({ 
          code: 'FORBIDDEN',
          status: 403,
          message: 'Forbidden'
        })
      }

      if (response.status === 401 && user) {
        console.log('Auto logout')
        // logout()
        return Promise.reject({ 
          code: 'UNAUTHORIZED',
          status: 401,
          message: 'Unauthorized'
        })
      }

      // Try catch cac loi khac:)))
      const error = (data && data.message) || response.statusText
      return Promise.reject({ 
        code: 'UNKNOWN',
        status: response.status,
        message: error 
      })
    }

    return data
  })
}