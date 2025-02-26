'use client'
import { ROUTE } from '@/loan/constants'
import { getRedirectUrl } from '@ui-kit/shared/routes'
import { useEffect } from 'react'
import Skeleton from '@mui/material/Skeleton'

// old redirects that were hardcoded in the react-router routes. The network name gets added in the redirect.
const REDIRECTS = [
  ROUTE.PAGE_MARKETS,
  ROUTE.PAGE_CRVUSD_STAKING,
  ROUTE.PAGE_DISCLAIMER,
  ROUTE.PAGE_PEGKEEPERS,
  ROUTE.PAGE_INTEGRATIONS,
]

// unfortunately we need to use a client route here as the `hash` part of the URL is only available at the client-side
export function Redirect() {
  useEffect(() => {
    const newUrl = getRedirectUrl('crvusd', window.location, REDIRECTS)
    console.log(`Redirecting from ${window.location.href} to ${newUrl}`)
    window.location.replace(newUrl)
  }, [])
  return <Skeleton />
}
