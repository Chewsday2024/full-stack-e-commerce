import { create } from 'zustand'
import { toast } from 'react-hot-toast'
import axios from '../lib/axios'
import { AxiosError } from 'axios'

type props = {
  name?: string
  email: string
  password: string
  confirmPassword?: string
}

type userStoreType = {
  user: {
    _id: string
    name: string
    email: string
    role: string
  } | null
  loading: boolean
  checkingAuth: boolean
  signup: ({ name, email, password, confirmPassword }: props) => Promise<string | undefined>
  login: ({ email, password }: props) => Promise<void>
  checkAuth: () => Promise<void>
  logout: () => Promise<void>
  refreshToken: () => Promise<void>
}


export const useUserStore = create<userStoreType>((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,
  signup: async ({ name, email, password, confirmPassword }) => {
    set({ loading: true })

    if (password !== confirmPassword) {
      set({ loading: false })
      return toast.error('Password do not match')
    }

    try {
      const res = await axios.post('/auth/signup', { name, email, password })
      set({ user: res.data, loading: false })
    } catch (error) {
      set({ loading: false })
      if (error instanceof AxiosError) toast.error(error.response?.data.message || 'An error occurred')     
    }
  },
  login: async ({ email, password }) => {
    set({ loading: true })

    try {
      const res = await axios.post('/auth/login', { email, password })
      set({ user: res.data, loading: false })
    } catch (error) {
      set({ loading: false })

      if (error) toast.error('錯誤的信箱或密碼')
    }
  },
  checkAuth: async () => {
    set({ checkingAuth: true })
    try {
      const res = await axios.get('/auth/profile')
      set({ user: res.data, checkingAuth: false })
    } catch (error) {
      if (error) set({ checkingAuth: false, user: null })
    }
  },
  logout: async () => {
    try {
      await axios.post('/auth/logout')
      set({ user: null })
    } catch (error) {
      if (error instanceof AxiosError) toast.error(error.response?.data.message || 'An error occurred during logout')
    }

  },
  refreshToken: async () => {
    if (get().checkingAuth) return

    set({ checkingAuth: true })

    try {
      const res = await axios.post('/auth/refresh-token')
      set({ checkingAuth: false })
      return res.data
    } catch (error) {
      set({ user: null, checkingAuth: false })

      throw error
    }
  }
}))



let refreshPromise: Promise<void> | null = null 

axios.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config
    if (error instanceof AxiosError) {
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true

        try {
          if (refreshPromise) {
            await refreshPromise

            return axios(originalRequest)
          }


          refreshPromise = useUserStore.getState().refreshToken()
          await refreshPromise
          refreshPromise = null

          return axios(originalRequest)
        } catch (refreshError) {
          useUserStore.getState().logout()

          return Promise.reject(refreshError)
        }
      }
    }
  }
)