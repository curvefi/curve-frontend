import { ReactNode } from 'react'
import useStore from '@/dao/store/useStore'
import { useConnection } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'

const useAutoRefresh = () => {
  const { curveApi } = useConnection()
  const fetchAllStoredUsdRates = useStore((state) => state.usdRates.fetchAllStoredUsdRates)
  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const getGauges = useStore((state) => state.gauges.getGauges)
  const getGaugesData = useStore((state) => state.gauges.getGaugesData)
  usePageVisibleInterval(
    () => Promise.all([curveApi && fetchAllStoredUsdRates(curveApi), getGauges(), getGaugesData()]),
    REFRESH_INTERVAL['5m'],
    isPageVisible,
  )
}

export const BaseLayout = ({ children }: { children: ReactNode }) => {
  useAutoRefresh()
  return children
}
