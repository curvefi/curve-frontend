import { useCallback, useEffect, useState } from 'react'
import { styled } from 'styled-components'
import { useAccount } from 'wagmi'
import { DetailPageStack } from '@/llamalend/components/DetailPageStack'
import { MarketDetails } from '@/llamalend/features/market-details'
import { NoPosition } from '@/llamalend/features/market-position-details'
import { useLoanExists } from '@/llamalend/queries/loan-exists'
import ChartOhlcWrapper from '@/loan/components/ChartOhlcWrapper'
import { MarketInformationComp } from '@/loan/components/MarketInformationComp'
import LoanCreate from '@/loan/components/PageLoanCreate/index'
import { hasLeverage } from '@/loan/components/PageLoanCreate/utils'
import { useMintMarket } from '@/loan/entities/mint-markets'
import { useMarketDetails } from '@/loan/hooks/useMarketDetails'
import useStore from '@/loan/store/useStore'
import { type CollateralUrlParams, type LlamaApi, Llamma } from '@/loan/types/loan.types'
import { getTokenName } from '@/loan/utils/utilsLoan'
import {
  getLoanCreatePathname,
  getLoanManagePathname,
  parseCollateralParams,
  useChainId,
} from '@/loan/utils/utilsRouter'
import Stack from '@mui/material/Stack'
import { AppPageFormsWrapper, AppPageFormTitleWrapper } from '@ui/AppPage'
import Box from '@ui/Box'
import Button from '@ui/Button'
import Icon from '@ui/Icon'
import TextEllipsis from '@ui/TextEllipsis'
import { breakpoints } from '@ui/utils/responsive'
import { ConnectWalletPrompt, isLoading, useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useNavigate, useParams } from '@ui-kit/hooks/router'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

const Page = () => {
  const params = useParams<CollateralUrlParams>()
  const { rFormType = null, rCollateralId } = parseCollateralParams(params)
  const push = useNavigate()
  const { connectState, llamaApi: curve = null } = useConnection()
  const rChainId = useChainId(params)
  const { connect: connectWallet, provider } = useWallet()
  const { address } = useAccount()
  const [loaded, setLoaded] = useState(false)

  const { data: market } = useMintMarket({ chainId: rChainId, marketId: rCollateralId })
  const marketId = market?.id ?? ''
  const pageLoaded = !isLoading(connectState)

  const formValues = useStore((state) => state.loanCreate.formValues)
  const { data: loanExists } = useLoanExists({ chainId: rChainId, marketId, userAddress: address })
  const isMdUp = useLayoutStore((state) => state.isMdUp)
  const isPageVisible = useLayoutStore((state) => state.isPageVisible)
  const fetchLoanDetails = useStore((state) => state.loans.fetchLoanDetails)
  const fetchUserLoanWalletBalances = useStore((state) => state.loans.fetchUserLoanWalletBalances)
  const resetUserDetailsState = useStore((state) => state.loans.resetUserDetailsState)
  const setFormValues = useStore((state) => state.loanCreate.setFormValues)
  const setStateByKeys = useStore((state) => state.loanCreate.setStateByKeys)
  const { chartExpanded, setChartExpanded } = useStore((state) => state.ohlcCharts)

  const maxSlippage = useUserProfileStore((state) => state.maxSlippage.crypto)

  const isReady = !!market
  const isLeverage = rFormType === 'leverage'

  const marketDetails = useMarketDetails({ chainId: rChainId, llamma: market, llammaId: marketId })

  const fetchInitial = useCallback(
    (curve: LlamaApi, isLeverage: boolean, llamma: Llamma) => {
      // reset createLoan estGas, detailInfo state
      setStateByKeys({
        formEstGas: {},
        detailInfo: {},
        detailInfoLeverage: {},
        liqRanges: {},
        liqRangesMapper: {},
        maxRecv: {},
        maxRecvLeverage: {},
      })

      const updatedFormValues = { ...formValues, n: formValues.n || llamma.defaultBands }
      void setFormValues(curve, isLeverage, llamma, updatedFormValues, maxSlippage)

      if (curve.signerAddress) {
        void fetchUserLoanWalletBalances(curve, llamma)
      }
    },
    [fetchUserLoanWalletBalances, formValues, maxSlippage, setFormValues, setStateByKeys],
  )

  useEffect(() => {
    if (pageLoaded && curve && market) {
      resetUserDetailsState(market)
      fetchInitial(curve, isLeverage, market)
      void fetchLoanDetails(curve, market)
      setLoaded(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageLoaded && curve && market])

  // redirect if loan exists
  useEffect(() => {
    if (!loaded && market && loanExists) {
      push(getLoanManagePathname(params, market.id, 'loan'))
    }
  }, [loaded, loanExists, market, params, push])

  //  redirect if form is leverage but no leverage option
  useEffect(() => {
    if (market && rFormType === 'leverage' && !hasLeverage(market)) {
      push(getLoanCreatePathname(params, market.id))
    }
  }, [loaded, rFormType, market, push, params])

  // max slippage updated
  useEffect(() => {
    if (loaded && !!curve && market) {
      void setFormValues(curve, isLeverage, market, formValues, maxSlippage)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [maxSlippage])

  usePageVisibleInterval(
    () => {
      if (isPageVisible && curve && market) {
        void fetchLoanDetails(curve, market)
      }
    },
    REFRESH_INTERVAL['1m'],
    isPageVisible,
  )

  useEffect(() => {
    if (!isMdUp && chartExpanded) {
      setChartExpanded(false)
    }
  }, [chartExpanded, isMdUp, setChartExpanded])

  const TitleComp = () => (
    <AppPageFormTitleWrapper>
      <Title>{market?.id === 'sfrxeth2' ? 'sfrxETH v2' : getTokenName(market).collateral}</Title>
    </AppPageFormTitleWrapper>
  )

  return provider ? (
    <>
      {chartExpanded && (
        <PriceAndTradesExpandedContainer>
          <Box flex padding="0 0 0 var(--spacing-2)">
            {isMdUp && <TitleComp />}
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
            <ChartOhlcWrapper rChainId={rChainId} llamma={market ?? null} llammaId={marketId} />
          </PriceAndTradesExpandedWrapper>
        </PriceAndTradesExpandedContainer>
      )}
      <DetailPageStack>
        <AppPageFormsWrapper>
          {rChainId && rCollateralId && (
            <LoanCreate
              curve={curve}
              isReady={isReady}
              isLeverage={isLeverage}
              loanExists={loanExists}
              llamma={market ?? null}
              llammaId={marketId}
              params={params}
              rChainId={rChainId}
              rCollateralId={rCollateralId}
              rFormType={rFormType}
              fetchInitial={fetchInitial}
            />
          )}
        </AppPageFormsWrapper>
        <Stack flexDirection="column" flexGrow={1} sx={{ gap: Spacing.md }}>
          {!loanExists && (
            <Stack padding={Spacing.md} sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
              <NoPosition type="borrow" />
            </Stack>
          )}
          <Stack>
            <MarketDetails {...marketDetails} />
            {market && (
              <MarketInformationComp
                llamma={market}
                llammaId={marketId}
                chainId={rChainId}
                chartExpanded={chartExpanded}
                page="create"
              />
            )}
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

const Title = styled(TextEllipsis)`
  color: var(--page--text-color);
  font-size: var(--font-size-5);
  font-weight: bold;
  line-height: 1;
  padding: 0 2px;
`

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
