import type { NextPage } from 'next'
import { t } from '@ui-kit/lib/i18n'
import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import { ROUTE } from '@/dex/constants'
import { breakpoints, isLoading } from '@ui/utils'
import { getPath } from '@/dex/utils/utilsRouter'
import { scrollToTop } from '@/dex/utils'
import usePageOnMount from '@/dex/hooks/usePageOnMount'
import useStore from '@/dex/store/useStore'
import useTokensMapper from '@/dex/hooks/useTokensMapper'
import AdvancedSettings from '@/dex/components/AdvancedSettings'
import Box, { BoxHeader } from '@ui/Box'
import DocumentHead from '@/dex/layout/default/DocumentHead'
import IconButton from '@ui/IconButton'
import QuickSwap from '@/dex/components/PageRouterSwap/index'
import { ConnectWalletPrompt, useWallet } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'

const Page: NextPage = () => {
  const params = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { pageLoaded, routerParams } = usePageOnMount(params, location, navigate)
  const { rChainId } = routerParams

  const getNetworkConfigFromApi = useStore((state) => state.getNetworkConfigFromApi)
  const isLoadingCurve = useStore((state) => state.isLoadingCurve)
  const routerCached = useStore((state) => state.storeCache.routerFormValues[rChainId])
  const { provider } = useWallet()
  const nativeToken = useStore((state) => state.networks.nativeToken[rChainId])
  const network = useStore((state) => state.networks.networks[rChainId])
  const connectWallet = useStore((s) => s.updateConnectState)
  const connectState = useStore((s) => s.connectState)
  const { tokensMapper, tokensMapperStr } = useTokensMapper(rChainId)

  const maxSlippage = useUserProfileStore((state) => state.maxSlippage.global)
  const setMaxSlippage = useUserProfileStore((state) => state.setMaxSlippage)

  const [loaded, setLoaded] = useState(false)

  const { hasRouter } = getNetworkConfigFromApi(rChainId)
  const paramsFromAddress = searchParams.get('from')?.toLowerCase() || nativeToken?.address || ''
  const paramsToAddress = searchParams.get('to')?.toLowerCase() || nativeToken?.wrappedAddress || ''
  const paramsMaxSlippage = searchParams.get('slippage')

  const redirect = useCallback(
    (toAddress: string, fromAddress: string) => {
      let pathname = ''
      if (fromAddress && toAddress) {
        pathname += `?from=${fromAddress}&to=${toAddress}`
      } else if (fromAddress) {
        pathname += `?from=${fromAddress}`
      } else if (toAddress) {
        pathname += `?to=${toAddress}`
      }
      if (pathname && pathname !== location.search) {
        navigate(getPath(params, `${ROUTE.PAGE_SWAP}${pathname}`))
      }
    },
    [location.search, navigate, params],
  )

  useEffect(() => {
    scrollToTop()
  }, [])

  // redirect to poolList if Swap is excluded from route
  useEffect(() => {
    setLoaded(false)
    if (pageLoaded && !isLoadingCurve && rChainId && typeof hasRouter !== 'undefined') {
      if (!hasRouter) {
        navigate(getPath(params, `${ROUTE.PAGE_POOLS}`))
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
    pageLoaded,
    isLoadingCurve,
    hasRouter,
    paramsFromAddress,
    paramsToAddress,
    paramsMaxSlippage,
    rChainId,
    tokensMapperStr,
    routerCached?.fromAddress,
    routerCached?.toAddress,
  ])

  return (
    <>
      <DocumentHead title={t`Swap`} />
      {!provider ? (
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
      ) : (
        <StyledQuickSwapWrapper variant="primary" shadowed>
          <BoxHeader className="title-text">
            <IconButton testId="hidden" hidden />
            {t`Swap`}
            <AdvancedSettings stateKey="global" testId="advance-settings" maxSlippage={maxSlippage} />
          </BoxHeader>

          <Box grid gridRowGap={3} padding>
            {rChainId && (
              <QuickSwap
                pageLoaded={loaded}
                params={params}
                searchedParams={{
                  fromAddress: paramsFromAddress,
                  toAddress: paramsToAddress,
                }}
                rChainId={rChainId}
                tokensMapper={tokensMapper}
                tokensMapperStr={tokensMapperStr}
                redirect={redirect}
              />
            )}
          </Box>
        </StyledQuickSwapWrapper>
      )}
    </>
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

export default Page
