import { useCallback, useEffect, useMemo, useState } from 'react'
import { styled } from 'styled-components'
import { QuickSwap } from '@/dex/components/PageRouterSwap/index'
import { ROUTE } from '@/dex/constants'
import { useNetworkByChain } from '@/dex/entities/networks'
import { useChainId } from '@/dex/hooks/useChainId'
import { useTokensMapper } from '@/dex/hooks/useTokensMapper'
import { markSwapFirstInteractive, startSwapPerfTracking } from '@/dex/lib/swapPerformance'
import { useStore } from '@/dex/store/useStore'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import { BoxHeader, Box } from '@ui/Box'
import { IconButton } from '@ui/IconButton'
import { breakpoints } from '@ui/utils'
import { isLoading, useCurve } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useNavigate, useSearchParams, useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'

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

  useEffect(() => {
    startSwapPerfTracking(window.location.pathname)
  }, [])

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  useEffect(() => {
    if (loaded) markSwapFirstInteractive()
  }, [loaded])
  return (
    <StyledQuickSwapWrapper variant="primary" shadowed data-testid="swap-page">
      <BoxHeader className="title-text">
        <IconButton testId="hidden" hidden />
        {t`Swap`}
        <IconButton testId="hidden" hidden />
      </BoxHeader>

      <Box grid gridRowGap={3} padding>
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
      </Box>
    </StyledQuickSwapWrapper>
  )
}

const StyledQuickSwapWrapper = styled(Box)`
  margin-top: 1rem;
  width: 100%;

  @media (min-width: ${breakpoints.sm}rem) {
    margin: 1.5rem auto;
    max-width: var(--transfer-min-width);
  }
`
