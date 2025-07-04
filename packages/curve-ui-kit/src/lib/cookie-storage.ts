import Cookies from 'js-cookie'
import type { PersistStorage } from 'zustand/middleware'

const COOKIE_OPTIONS = {
  expires: 365, // 1 year
  sameSite: 'lax' as const,
  secure: process.env.NODE_ENV === 'production',
}

function readCookie(cookieName: string) {
  const value = Cookies.get(cookieName)
  return value == null ? null : JSON.parse(value)
}

export const USER_PROFILE_COOKIE_NAME = 'curve-user-profile'

export const createCookieStorage = <T>(cookieName: string): PersistStorage<T> => ({
  getItem: (name) => readCookie(cookieName)?.[name] ?? null,
  setItem: (name, value) =>
    Cookies.set(
      cookieName,
      JSON.stringify({
        ...readCookie(cookieName),
        [name]: JSON.stringify(value),
      }),
      COOKIE_OPTIONS,
    ),
  removeItem: (name) => {
    const cookie = readCookie(cookieName)
    delete cookie[name]
    Cookies.set(cookieName, JSON.stringify(cookie), COOKIE_OPTIONS)
  },
})
