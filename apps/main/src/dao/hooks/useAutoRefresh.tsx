import { useStore } from '@/dao/store/useStore'
import { usePageVisibleInterval } from '@ui-kit/hooks/usePageVisibleInterval'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'

export const useAutoRefresh = (isHydrated: boolean) => {
  const getGauges = useStore((state) => state.gauges.getGauges)
  const getGaugesData = useStore((state) => state.gauges.getGaugesData)
  usePageVisibleInterval(() => isHydrated && Promise.all([getGauges(), getGaugesData()]), REFRESH_INTERVAL['5m'])
}
