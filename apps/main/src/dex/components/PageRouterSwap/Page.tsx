import { useCallback, useEffect, useMemo, useState } from 'react'
import { QuickSwap } from '@/dex/components/PageRouterSwap/index'
import { ROUTE } from '@/dex/constants'
import { useNetworkByChain } from '@/dex/entities/networks'
import { useChainId } from '@/dex/hooks/useChainId'
import { useTokensMapper } from '@/dex/hooks/useTokensMapper'
import { useStore } from '@/dex/store/useStore'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import { isLoading, useCurve } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useNavigate, useSearchParams, useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { MaxWidth } = SizesAndSpaces

export const PageRouterSwap = () => {
  const props = useParams<NetworkUrlParams>()
  const push = useNavigate()
  const searchParams = useSearchParams()
  const searchParamsString = searchParams?.toString() || ''
  const { curveApi = null, connectState } = useCurve()
  const rChainId = useChainId(props.network)
  const isConnecting = isLoading(connectState)

  const getNetworkConfigFromApi = useStore((state) => state.getNetworkConfigFromApi)
  const routerCachedFromAddress = useStore((state) => state.storeCache.routerFormValues[rChainId]?.fromAddress)
  const routerCachedToAddress = useStore((state) => state.storeCache.routerFormValues[rChainId]?.toAddress)
  const { data: network } = useNetworkByChain({ chainId: rChainId })
  const setMaxSlippage = useUserProfileStore((state) => state.setMaxSlippage)

  const { tokensMapper, tokensMapperStr } = useTokensMapper(rChainId)
  const [loaded, setLoaded] = useState(false)

  const { hasRouter } = getNetworkConfigFromApi(rChainId)
  const nativeToken = curveApi?.getNetworkConstants()?.NATIVE_TOKEN
  const paramsFromAddress = searchParams?.get('from')?.toLowerCase() || nativeToken?.address || ''
  const paramsToAddress = searchParams?.get('to')?.toLowerCase() || nativeToken?.wrappedAddress || ''
  const paramsMaxSlippage = searchParams?.get('slippage')
  const searchedParams = useMemo(
    () => ({
      fromAddress: paramsFromAddress,
      toAddress: paramsToAddress,
    }),
    [paramsFromAddress, paramsToAddress],
  )

  const redirect = useCallback(
    (to: string, from: string) => {
      const search = from || to ? `?${new URLSearchParams({ ...(from && { from }), ...(to && { to }) })}` : ''
      if (search !== searchParamsString) {
        push(search)
      }
    },
    [searchParamsString, push],
  )

  // redirect to poolList if Swap is excluded from route
  useEffect(() => {
    setLoaded(false)
    if (!isConnecting && rChainId && typeof hasRouter !== 'undefined') {
      if (!hasRouter) {
        push(getPath(props, `${ROUTE.PAGE_POOLS}`))
        return
      }
      if (paramsMaxSlippage) {
        setMaxSlippage(paramsMaxSlippage)
      }

      const routerDefault = network.swap
      if (Object.keys(tokensMapper).length && !!routerDefault) {
        const isValidParamsFromAddress = !!paramsFromAddress && !!tokensMapper[paramsFromAddress]
        const isValidParamsToAddress = !!paramsToAddress && !!tokensMapper[paramsToAddress]

        if (
          !paramsFromAddress ||
          !paramsToAddress ||
          !isValidParamsFromAddress ||
          !isValidParamsToAddress ||
          paramsToAddress === paramsFromAddress
        ) {
          const fromAddress = routerCachedFromAddress ?? routerDefault.fromAddress
          const toAddress = routerCachedToAddress ?? routerDefault.toAddress
          if (!!toAddress && !!fromAddress) redirect(toAddress, fromAddress)
        } else {
          setLoaded(true)
        }
      }
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [
    isConnecting,
    hasRouter,
    paramsFromAddress,
    paramsToAddress,
    paramsMaxSlippage,
    rChainId,
    tokensMapperStr,
    routerCachedFromAddress,
    routerCachedToAddress,
  ])
  return (
    <Card sx={{ maxWidth: MaxWidth.actionCard, margin: '0 auto' }}>
      <CardHeader title={t`Swap`} />
      <CardContent>
        {rChainId && (
          <QuickSwap
            curve={curveApi}
            pageLoaded={loaded}
            params={props}
            searchedParams={searchedParams}
            rChainId={rChainId}
            tokensMapper={tokensMapper}
            tokensMapperStr={tokensMapperStr}
            redirect={redirect}
          />
        )}
      </CardContent>
    </Card>
  )
}
