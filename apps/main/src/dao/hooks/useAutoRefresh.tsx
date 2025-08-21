import useStore from '@/dao/store/useStore'
import { useLayoutStore } from '@ui-kit/features/layout'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'

export const useAutoRefresh = (isHydrated: boolean) => {
  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const getGauges = useStore((state) => state.gauges.getGauges)
  const getGaugesData = useStore((state) => state.gauges.getGaugesData)
  usePageVisibleInterval(
    () => Promise.all([getGauges(), getGaugesData()]),
    REFRESH_INTERVAL['5m'],
    isPageVisible && isHydrated,
  )
}
