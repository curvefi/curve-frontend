'use client'
import { type AppName } from './routes'
import { useEffect } from 'react'
import Skeleton from '@mui/material/Skeleton'

const defaultPages = { dex: 'pools', lend: 'markets', crvusd: 'markets', dao: 'proposals' }

/**
 * Get the redirect URL for the app root URL. This is the entry point of the old routes with the hash router.
 * We remove the hash and redirect to the new routes. We also handle old routes that were hardcoded in react-router.
 */
function getRedirectUrl(app: AppName, { origin, search, hash }: Location, routes: string[]) {
  const path = hash.replace(/^#/, '')
  if (routes.find((r) => r.startsWith(path))) {
    return `${origin}/${app}/ethereum/${path}${search}`
  }
  if (path) {
    return `${origin}/${app}/${path}${search}`
  }
  return `${origin}/${app}/ethereum/${defaultPages[app]}`
}

// unfortunately we need to use a client route here as the `hash` part of the URL is only available at the client-side
export function HashRouterRedirect({ app, redirects }: { app: AppName; redirects: string[] }) {
  useEffect(() => {
    const newUrl = getRedirectUrl(app, window.location, redirects)
    console.log(`Redirecting from ${window.location.href} to ${newUrl}`)
    window.location.replace(newUrl)
  }, [app, redirects])
  return <Skeleton />
}
