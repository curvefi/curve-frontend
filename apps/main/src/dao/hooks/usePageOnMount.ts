import { useParams } from 'next/navigation'
import { useEffect } from 'react'
import useStore from '@/dao/store/useStore'
import { type CurveApi, PageProps, type UrlParams } from '@/dao/types/dao.types'
import { parseParams } from '@/dao/utils/utilsRouter'
import { useWallet } from '@ui-kit/features/connect-wallet'
import {
  CONNECT_STAGE,
  isLoading,
  isSuccess,
  useConnection,
} from '@ui-kit/features/connect-wallet/lib/connection.context'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { useApiStore } from '@ui-kit/shared/useApiStore'

function usePageOnMount(chainIdNotRequired?: boolean) {
  const params = useParams() as UrlParams
  const parsedParams = parseParams(params, chainIdNotRequired)
  const { lib: curve, connectState } = useConnection<CurveApi>()
  const { wallet } = useWallet()

  const updateUserData = useStore((state) => state.user.updateUserData)
  const fetchAllStoredUsdRates = useStore((state) => state.usdRates.fetchAllStoredUsdRates)
  const isPageVisible = useStore((state) => state.isPageVisible)
  const getProposals = useStore((state) => state.proposals.getProposals)
  const getGauges = useStore((state) => state.gauges.getGauges)
  const getGaugesData = useStore((state) => state.gauges.getGaugesData)

  const updateConnectState = useStore((state) => state.updateConnectState)
  const updateCurve = useApiStore((state) => state.updateCurve)
  const setIsLoadingCurve = useApiStore((state) => state.setIsLoadingCurve)

  useEffect(() => {
    curve && updateCurve(curve)
  }, [curve, updateCurve])
  useEffect(() => {
    updateConnectState(connectState.status, connectState.stage)
    setIsLoadingCurve(isLoading(connectState, CONNECT_STAGE.CONNECT_API))
  }, [connectState, setIsLoadingCurve, updateConnectState])

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
      getProposals()
      void getGauges()
      void getGaugesData()
    },
    REFRESH_INTERVAL['5m'],
    isPageVisible,
  )

  // initiate proposals list
  useEffect(() => {
    getProposals()
    void getGauges()
    void getGaugesData()
  }, [getGauges, getProposals, getGaugesData])

  return {
    pageLoaded: connectState.status === 'success',
    routerParams: parsedParams,
    curve,
  } as PageProps
}

export default usePageOnMount
