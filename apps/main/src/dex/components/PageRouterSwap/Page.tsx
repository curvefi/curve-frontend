import { useCallback, useEffect, useMemo, useState } from 'react'
import { styled } from 'styled-components'
import QuickSwap from '@/dex/components/PageRouterSwap/index'
import { ROUTE } from '@/dex/constants'
import { useChainId } from '@/dex/hooks/useChainId'
import useTokensMapper from '@/dex/hooks/useTokensMapper'
import useStore from '@/dex/store/useStore'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import Box, { BoxHeader } from '@ui/Box'
import IconButton from '@ui/IconButton'
import { breakpoints } from '@ui/utils'
import { ConnectWalletPrompt, isLoading, useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useNavigate, useSearchParams, useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'

export const PageRouterSwap = () => {
  const props = useParams<NetworkUrlParams>()
  const push = useNavigate()
  const searchParams = useSearchParams()
  const { curveApi = null, connectState } = useConnection()
  const { connect: connectWallet, provider } = useWallet()
  const rChainId = useChainId(props.network)

  const getNetworkConfigFromApi = useStore((state) => state.getNetworkConfigFromApi)
  const routerCached = useStore((state) => state.storeCache.routerFormValues[rChainId])
  const nativeToken = useStore((state) => state.networks.nativeToken[rChainId])
  const network = useStore((state) => state.networks.networks[rChainId])
  const setMaxSlippage = useUserProfileStore((state) => state.setMaxSlippage)

  const { tokensMapper, tokensMapperStr } = useTokensMapper(rChainId)
  const [loaded, setLoaded] = useState(false)

  const { hasRouter } = getNetworkConfigFromApi(rChainId)
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
      if (search !== searchParams?.toString()) {
        push(getPath(props, `${ROUTE.PAGE_SWAP}${search}`))
      }
    },
    [searchParams, push, props],
  )

  // redirect to poolList if Swap is excluded from route
  useEffect(() => {
    setLoaded(false)
    if (!isLoading(connectState) && rChainId && typeof hasRouter !== 'undefined') {
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
          const fromAddress = routerCached?.fromAddress ?? routerDefault.fromAddress
          const toAddress = routerCached?.toAddress ?? routerDefault.toAddress
          if (!!toAddress && !!fromAddress) redirect(toAddress, fromAddress)
        } else {
          setLoaded(true)
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    connectState,
    hasRouter,
    paramsFromAddress,
    paramsToAddress,
    paramsMaxSlippage,
    rChainId,
    tokensMapperStr,
    routerCached?.fromAddress,
    routerCached?.toAddress,
  ])

  if (!provider) {
    return (
      <Box display="flex" fillWidth flexJustifyContent="center">
        <ConnectWalletWrapper>
          <ConnectWalletPrompt
            description="Connect wallet to swap"
            connectText="Connect Wallet"
            loadingText="Connecting"
            connectWallet={() => connectWallet()}
            isLoading={isLoading(connectState)}
          />
        </ConnectWalletWrapper>
      </Box>
    )
  }
  return (
    <StyledQuickSwapWrapper variant="primary" shadowed>
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

const ConnectWalletWrapper = styled.div`
  display: flex;
  margin: var(--spacing-3) auto;
`
