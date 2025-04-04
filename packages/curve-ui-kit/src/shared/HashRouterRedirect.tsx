'use client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import Skeleton from '@mui/material/Skeleton'
import { type AppName } from './routes'

const defaultPages = { dex: 'pools', lend: 'markets', crvusd: 'markets', dao: 'proposals' }
const oldOrigins = ['lend', 'crvusd', 'dao'] as const

/**
 * Get the redirect URL for the app root URL. This is the entry point of the old routes with the hash router.
 * We remove the hash and redirect to the new routes. We also handle old routes that were hardcoded in react-router.
 */
function getRedirectUrl({ search, hash, origin }: Location, currentApp?: AppName, routes?: string[]) {
  const path = hash.replace(/^#\//, '')
  const destApp = currentApp ?? oldOrigins.find((path) => origin.startsWith(path)) ?? 'dex'
  if (routes?.find((r) => r.startsWith(path))) {
    return `/${destApp}/ethereum/${path}${search}`
  }
  if (path) {
    return `/${destApp}/${path}${search}`
  }
  return `/${destApp}/ethereum/${defaultPages[destApp]}`
}

// unfortunately we need to use a client route here as the `hash` part of the URL is only available at the client-side
export function HashRouterRedirect({ app, redirects }: { app?: AppName; redirects?: string[] }) {
  const { replace } = useRouter()
  useEffect(() => {
    const newUrl = getRedirectUrl(window.location, app, redirects)
    console.info(`Redirecting from ${window.location.href} to ${newUrl}`)
    replace(newUrl)
  }, [app, replace, redirects])
  return <Skeleton />
}
