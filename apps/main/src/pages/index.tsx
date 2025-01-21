import { useEffect } from 'react'

export default function Index() {
  useEffect(() => {
    location.href = `/dex${location.search}${location.hash}`
  }, [])
  return null
}
