import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import useStore from '@/dao/store/useStore'
import { type CurveApi, PageProps, type UrlParams } from '@/dao/types/dao.types'
import { parseParams } from '@/dao/utils/utilsRouter'
import { isLoading, isSuccess, useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'

export function usePageOnMount(chainIdNotRequired?: boolean): PageProps {
  const params = useParams() as UrlParams
  const routerParams = parseParams(params, chainIdNotRequired)
  const { lib: curve = null, connectState } = useConnection<CurveApi>()
  const { wallet } = useWallet()

  const updateUserData = useStore((state) => state.user.updateUserData)
  const fetchAllStoredUsdRates = useStore((state) => state.usdRates.fetchAllStoredUsdRates)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const getGauges = useStore((state) => state.gauges.getGauges)
  const getGaugesData = useStore((state) => state.gauges.getGaugesData)

  // todo: fetches below could be moved to hydrate probably? Check with @JustJousting
  useEffect(() => {
    if (isSuccess(connectState) && curve && wallet) {
      updateUserData(curve, wallet)
    }
  }, [curve, connectState, updateUserData, wallet])

  useEffect(() => {
    if (curve) {
      void fetchAllStoredUsdRates(curve)
    }
  }, [curve, fetchAllStoredUsdRates])

  usePageVisibleInterval(
    () => {
      if (curve) {
        void fetchAllStoredUsdRates(curve)
      }
      void getGauges()
      void getGaugesData()
    },
    REFRESH_INTERVAL['5m'],
    isPageVisible,
  )

  // initiate gauges data
  useEffect(() => {
    void getGauges()
    void getGaugesData()
  }, [getGauges, getGaugesData])

  return { pageLoaded: !isLoading(connectState), routerParams, curve }
}
