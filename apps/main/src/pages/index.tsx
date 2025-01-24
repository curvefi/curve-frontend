import { useEffect } from 'react'

export default function Index() {
  useEffect(() => {
    const subdomain = location.hostname.match(/(?:staging)?(?:(\w+).)?curve.fi/)?.[1]
    if (subdomain) {
      location.href = `https://curve.fi/${subdomain}${location.search}${location.hash}`
    } else {
      location.href = `/dex${location.search}${location.hash}`
    }
  }, [])
  return null
}
