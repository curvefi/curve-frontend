import { useEffect, useState } from 'react'
import { styled } from 'styled-components'
import { Address } from 'viem'
import { useAccount } from 'wagmi'
import { DetailPageStack } from '@/llamalend/components/DetailPageStack'
import { MarketDetails } from '@/llamalend/features/market-details'
import { BorrowPositionDetails, NoPosition } from '@/llamalend/features/market-position-details'
import { UserPositionHistory } from '@/llamalend/features/user-position-history'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { useLoanExists } from '@/llamalend/queries/loan-exists'
import ChartOhlcWrapper from '@/loan/components/ChartOhlcWrapper'
import { MarketInformationComp } from '@/loan/components/MarketInformationComp'
import LoanMange from '@/loan/components/PageLoanManage/index'
import type { FormType } from '@/loan/components/PageLoanManage/types'
import { hasDeleverage } from '@/loan/components/PageLoanManage/utils'
import { useLoanPositionDetails } from '@/loan/hooks/useLoanPositionDetails'
import { useMarketDetails } from '@/loan/hooks/useMarketDetails'
import useTitleMapper from '@/loan/hooks/useTitleMapper'
import networks from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import type { CollateralUrlParams } from '@/loan/types/loan.types'
import {
  getCollateralListPathname,
  getLoanCreatePathname,
  parseCollateralParams,
  useChainId,
} from '@/loan/utils/utilsRouter'
import { isChain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import { AppPageFormsWrapper } from '@ui/AppPage'
import Box from '@ui/Box'
import Button from '@ui/Button'
import Icon from '@ui/Icon'
import { breakpoints } from '@ui/utils/responsive'
import { ConnectWalletPrompt, isLoading, useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useNavigate, useParams } from '@ui-kit/hooks/router'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { CRVUSD } from '@ui-kit/utils/address'
import { errorFallback } from '@ui-kit/utils/error.util'

const { Spacing } = SizesAndSpaces

const Page = () => {
  const params = useParams<CollateralUrlParams>()
  const { rFormType, rCollateralId } = parseCollateralParams(params)
  const push = useNavigate()
  const { connectState, llamaApi: curve = null, isHydrated } = useConnection()
  const titleMapper = useTitleMapper()
  const rChainId = useChainId(params)
  const { address } = useAccount()

  const llamma = useStore((state) => state.collaterals.collateralDatasMapper[rChainId]?.[rCollateralId]?.llamma)
  const llammaId = llamma?.id || ''

  const isMdUp = useLayoutStore((state) => state.isMdUp)
  const { data: loanExists } = useLoanExists({ chainId: rChainId, marketId: llammaId, userAddress: address })
  const fetchLoanDetails = useStore((state) => state.loans.fetchLoanDetails)
  const fetchUserLoanDetails = useStore((state) => state.loans.fetchUserLoanDetails)
  const resetUserDetailsState = useStore((state) => state.loans.resetUserDetailsState)
  const chartExpanded = useStore((state) => state.ohlcCharts.chartExpanded)
  const setChartExpanded = useStore((state) => state.ohlcCharts.setChartExpanded)
  const { provider, connect: connectWallet } = useWallet()

  const [loaded, setLoaded] = useState(false)

  const isValidRouterParams = !!rChainId && !!rCollateralId && !!rFormType
  const isReady = !!curve?.signerAddress && !!llamma

  const marketDetails = useMarketDetails({ chainId: rChainId, llamma, llammaId })
  const positionDetails = useLoanPositionDetails({
    chainId: rChainId,
    llamma,
    llammaId,
  })

  const network = networks[rChainId]
  const {
    data: userCollateralEvents,
    isLoading: collateralEventsIsLoading,
    isError: collateralEventsIsError,
  } = useUserCollateralEvents({
    app: 'crvusd',
    chain: isChain(network.id) ? network.id : undefined,
    controllerAddress: llamma?.controller as Address,
    userAddress: curve?.signerAddress,
    collateralToken: {
      symbol: llamma?.collateralSymbol,
      address: llamma?.collateral,
      decimals: llamma?.collateralDecimals,
      name: llamma?.collateralSymbol,
    },
    borrowToken: CRVUSD,
    network,
  })

  useEffect(() => {
    if (isHydrated && curve) {
      if (rCollateralId && llamma) {
        ;(async () => {
          const fetchedLoanDetails = await fetchLoanDetails(curve, llamma)
          if (!fetchedLoanDetails.loanExists) {
            resetUserDetailsState(llamma)
            push(getLoanCreatePathname(params, rCollateralId))
          }
          setLoaded(true)
        })().catch(errorFallback)
      } else {
        console.warn(`Cannot find market ${rCollateralId}, redirecting to list`, params)
        push(getCollateralListPathname(params))
      }
    }
  }, [
    isReady,
    isHydrated,
    rFormType,
    curve,
    rCollateralId,
    llamma,
    fetchLoanDetails,
    resetUserDetailsState,
    push,
    params,
  ])

  //  redirect if form is deleverage but no deleverage option
  useEffect(() => {
    if (llamma && rFormType === 'deleverage' && !hasDeleverage(llamma)) {
      push(getLoanCreatePathname(params, llamma.id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, rFormType, llamma])

  usePageVisibleInterval(
    () =>
      curve?.signerAddress &&
      llamma &&
      loanExists &&
      Promise.all([fetchLoanDetails(curve, llamma), fetchUserLoanDetails(curve, llamma)]),
    REFRESH_INTERVAL['1m'],
  )

  useEffect(() => {
    if (!isMdUp && chartExpanded) {
      setChartExpanded(false)
    }
  }, [chartExpanded, isMdUp, setChartExpanded])

  const formProps = {
    curve,
    isReady: !!curve?.signerAddress && !!llamma,
    llamma,
    llammaId,
    rChainId,
  }

  return provider ? (
    <>
      {chartExpanded && (
        <PriceAndTradesExpandedContainer>
          <Box flex padding="0 0 0 var(--spacing-2)">
            <ExpandButton
              variant={'select'}
              onClick={() => {
                setChartExpanded()
              }}
            >
              {chartExpanded ? 'Minimize' : 'Expand'}
              <ExpandIcon name={chartExpanded ? 'Minimize' : 'Maximize'} size={16} aria-label={t`Expand chart`} />
            </ExpandButton>
          </Box>
          <PriceAndTradesExpandedWrapper variant="secondary">
            <ChartOhlcWrapper rChainId={rChainId} llamma={llamma} llammaId={llammaId} />
          </PriceAndTradesExpandedWrapper>
        </PriceAndTradesExpandedContainer>
      )}
      <DetailPageStack>
        <AppPageFormsWrapper>
          {isValidRouterParams && (
            <LoanMange
              {...formProps}
              params={params}
              rChainId={rChainId}
              rCollateralId={rCollateralId}
              rFormType={rFormType as FormType}
              titleMapper={titleMapper}
            />
          )}
        </AppPageFormsWrapper>
        <Stack flexDirection="column" flexGrow={1} sx={{ gap: Spacing.md }}>
          {loanExists ? (
            <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
              <BorrowPositionDetails {...positionDetails} />
              {userCollateralEvents?.events && userCollateralEvents.events.length > 0 && (
                <Stack
                  paddingLeft={Spacing.md}
                  paddingRight={Spacing.md}
                  paddingBottom={Spacing.md}
                  sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}
                >
                  <UserPositionHistory
                    events={userCollateralEvents.events}
                    isLoading={collateralEventsIsLoading}
                    isError={collateralEventsIsError}
                  />
                </Stack>
              )}
            </Stack>
          ) : (
            <Stack padding={Spacing.md} sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
              <NoPosition type="borrow" />
            </Stack>
          )}
          <Stack>
            <MarketDetails {...marketDetails} />
            <MarketInformationComp
              llamma={llamma}
              llammaId={llammaId}
              chainId={rChainId}
              chartExpanded={chartExpanded}
              page="manage"
            />
          </Stack>
        </Stack>
      </DetailPageStack>
    </>
  ) : (
    <Box display="flex" fillWidth flexJustifyContent="center" margin="var(--spacing-3) 0">
      <ConnectWalletPrompt
        description={t`Connect your wallet to view market`}
        connectText={t`Connect`}
        loadingText={t`Connecting`}
        connectWallet={() => connectWallet()}
        isLoading={isLoading(connectState)}
      />
    </Box>
  )
}

const PriceAndTradesExpandedContainer = styled(Box)`
  margin: 1.5rem 0 0;
  display: flex;
  @media (min-width: ${breakpoints.md}rem) {
    flex-direction: column;
  }
`

const PriceAndTradesExpandedWrapper = styled(Box)`
  background-color: var(--tab-secondary--content--background-color);
`

const ExpandButton = styled(Button)`
  margin: auto var(--spacing-3) auto auto;
  display: flex;
  align-content: center;
  color: inherit;
  font-size: var(--font-size-2);
`

const ExpandIcon = styled(Icon)`
  margin-left: var(--spacing-1);
`

export default Page
