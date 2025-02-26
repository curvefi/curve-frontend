import { ROUTE } from '@/loan/constants'

const ROUTES = Object.values(ROUTE)
const MovedPermanently = 301

function getRedirectUrl({ origin, search, hash }: URL) {
  if (ROUTES.includes(hash)) {
    // todo: consider route params, this is the old redirect in the routes
    return `${origin}/crvusd/ethereum/${hash}${search}`
  }
  if (hash) {
    return `${origin}/crvusd/${hash}${search}`
  }
  return `${origin}/crvusd/ethereum/markets`
}

export async function GET(request: Request) {
  const redirectUrl = getRedirectUrl(new URL(request.url))
  return Response.redirect(redirectUrl, MovedPermanently)
}
