'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import styled from 'styled-components'
import QuickSwap from '@/dex/components/PageRouterSwap/index'
import { ROUTE } from '@/dex/constants'
import { usePageProps } from '@/dex/hooks/usePageProps'
import useTokensMapper from '@/dex/hooks/useTokensMapper'
import useStore from '@/dex/store/useStore'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import { getPath } from '@/dex/utils/utilsRouter'
import TuneIcon from '@mui/icons-material/Tune'
import Box, { BoxHeader } from '@ui/Box'
import IconButton from '@ui/IconButton'
import { breakpoints } from '@ui/utils'
import { ConnectWalletPrompt, useWallet } from '@ui-kit/features/connect-wallet'
import { SlippageSettings } from '@ui-kit/features/slippage-settings'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { t } from '@ui-kit/lib/i18n'
import { InvertTheme } from '@ui-kit/shared/ui/ThemeProvider'

const Page = (params: NetworkUrlParams) => {
  const { push } = useRouter()
  const searchParams = useSearchParams()
  const { pageLoaded, routerParams, curve } = usePageProps()
  const { connect: connectWallet } = useWallet()
  const { rChainId } = routerParams

  const getNetworkConfigFromApi = useStore((state) => state.getNetworkConfigFromApi)
  const routerCached = useStore((state) => state.storeCache.routerFormValues[rChainId])
  const activeKey = useStore((state) => state.quickSwap.activeKey)
  const routesAndOutput = useStore((state) => state.quickSwap.routesAndOutput[activeKey])
  const { provider } = useWallet()
  const nativeToken = useStore((state) => state.networks.nativeToken[rChainId])
  const network = useStore((state) => state.networks.networks[rChainId])
  const theme = useUserProfileStore((state) => state.theme)
  const cryptoMaxSlippage = useUserProfileStore((state) => state.maxSlippage.crypto)
  const stableMaxSlippage = useUserProfileStore((state) => state.maxSlippage.stable)
  const setMaxSlippage = useUserProfileStore((state) => state.setMaxSlippage)
  const isStableswapRoute = routesAndOutput?.isStableswapRoute
  const storeMaxSlippage = isStableswapRoute ? stableMaxSlippage : cryptoMaxSlippage

  const { tokensMapper, tokensMapperStr } = useTokensMapper(rChainId)
  const [loaded, setLoaded] = useState(false)

  const { hasRouter } = getNetworkConfigFromApi(rChainId)
  const paramsFromAddress = searchParams?.get('from')?.toLowerCase() || nativeToken?.address || ''
  const paramsToAddress = searchParams?.get('to')?.toLowerCase() || nativeToken?.wrappedAddress || ''
  const paramsMaxSlippage = searchParams?.get('slippage')

  const redirect = useCallback(
    (to: string, from: string) => {
      const search = from || to ? `?${new URLSearchParams({ ...(from && { from }), ...(to && { to }) })}` : ''
      if (search !== searchParams?.toString()) {
        push(getPath(params, `${ROUTE.PAGE_SWAP}${search}`))
      }
    },
    [searchParams, push, params],
  )

  // redirect to poolList if Swap is excluded from route
  useEffect(() => {
    setLoaded(false)
    if (pageLoaded && rChainId && typeof hasRouter !== 'undefined') {
      if (!hasRouter) {
        push(getPath(params, `${ROUTE.PAGE_POOLS}`))
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
            isLoading={!pageLoaded}
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
        <SlippageSettings
          maxSlippage={storeMaxSlippage}
          onSave={(slippage) => setMaxSlippage(slippage, isStableswapRoute ? 'stable' : 'crypto')}
          buttonIcon={
            // This component is a MUI component on a non MUI page.
            // That means the icon button color doesn't mesh well with the header box color in chad theme.
            <InvertTheme inverted={theme === 'chad'}>
              <TuneIcon color="action" />
            </InvertTheme>
          }
        />
      </BoxHeader>

      <Box grid gridRowGap={3} padding>
        {rChainId && (
          <QuickSwap
            curve={curve}
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
