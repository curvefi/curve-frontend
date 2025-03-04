'use client'
import { type AppName } from './routes'
import { useEffect } from 'react'
import Skeleton from '@mui/material/Skeleton'

const defaultPages = { dex: 'pools', lend: 'markets', crvusd: 'markets', dao: 'proposals' }
const oldOrigins = ['lend', 'crvusd', 'dao'] as const

/**
 * Get the redirect URL for the app root URL. This is the entry point of the old routes with the hash router.
 * We remove the hash and redirect to the new routes. We also handle old routes that were hardcoded in react-router.
 */
function getRedirectUrl(loc: Location, currentApp?: AppName, routes?: string[]) {
  const { origin, search, hash } = loc
  const path = hash.replace(/^#\//, '')
  const destApp = currentApp ?? oldOrigins.find((path) => origin.includes(path)) ?? 'dex'

  console.log({
    oldOrigins,
    origin,
    search,
    hash,
    currentApp,
    destApp,
    routes,
  })

  if (routes?.find((r) => r.startsWith(path))) {
    return `${origin}/${destApp}/ethereum/${path}${search}`
  }
  if (path) {
    return `${origin}/${destApp}/${path}${search}`
  }
  return `${origin}/${destApp}/ethereum/${defaultPages[destApp]}`
}

// unfortunately we need to use a client route here as the `hash` part of the URL is only available at the client-side
export function HashRouterRedirect({ app, redirects }: { app?: AppName; redirects?: string[] }) {
  useEffect(() => {
    const newUrl = getRedirectUrl(window.location, app, redirects)
    console.log(`Redirecting from ${window.location.href} to ${newUrl}`)
    window.location.replace(newUrl)
  }, [app, redirects])
  return <Skeleton />
}
