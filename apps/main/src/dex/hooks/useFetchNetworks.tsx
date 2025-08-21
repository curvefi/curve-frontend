import { useEffect, useState } from 'react'
import useStore from '@/dex/store/useStore'

export function useFetchNetworks() {
  const fetchNetworks = useStore((state) => state.networks.fetchNetworks)
  const [appLoaded, setAppLoaded] = useState(false)
  useEffect(() => {
    const abort = new AbortController()
    void (async () => {
      try {
        await fetchNetworks()
      } finally {
        if (!abort.signal.aborted) {
          setAppLoaded(true)
        }
      }
    })()
    return () => {
      setAppLoaded(false)
      abort.abort()
    }
  }, [fetchNetworks])
  return appLoaded
}
