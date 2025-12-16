import { useCallback, useEffect, useState } from 'react'
import { styled } from 'styled-components'
import type { Address } from 'viem'
import { useConnection } from 'wagmi'
import { MarketDetails } from '@/llamalend/features/market-details'
import { NoPosition } from '@/llamalend/features/market-position-details'
import { UserPositionHistory } from '@/llamalend/features/user-position-history'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { useLoanExists } from '@/llamalend/queries/loan-exists'
import { DetailPageStack } from '@/llamalend/widgets/DetailPageStack'
import { MarketInformationComp } from '@/loan/components/MarketInformationComp'
import LoanCreate from '@/loan/components/PageLoanCreate/index'
import { useMintMarket } from '@/loan/entities/mint-markets'
import { useMarketDetails } from '@/loan/hooks/useMarketDetails'
import networks from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import { type CollateralUrlParams, type LlamaApi, Llamma } from '@/loan/types/loan.types'
import { hasV1Leverage } from '@/loan/utils/leverage'
import { getTokenName } from '@/loan/utils/utilsLoan'
import {
  getLoanCreatePathname,
  getLoanManagePathname,
  parseCollateralParams,
  useChainId,
} from '@/loan/utils/utilsRouter'
import { getCollateralListPathname } from '@/loan/utils/utilsRouter'
import { isChain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import { AppPageFormsWrapper, AppPageFormTitleWrapper } from '@ui/AppPage'
import Box from '@ui/Box'
import TextEllipsis from '@ui/TextEllipsis'
import { ConnectWalletPrompt, isLoading, useCurve, useWallet } from '@ui-kit/features/connect-wallet'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useNavigate, useParams } from '@ui-kit/hooks/router'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { CRVUSD } from '@ui-kit/utils/address'

const { Spacing } = SizesAndSpaces

const Page = () => {
  const params = useParams<CollateralUrlParams>()
  const { rFormType = null, rCollateralId } = parseCollateralParams(params)
  const push = useNavigate()
  const { isHydrated, llamaApi: curve = null, connectState } = useCurve()
  const rChainId = useChainId(params)
  const { connect: connectWallet, provider } = useWallet()
  const { address } = useConnection()
  const [loaded, setLoaded] = useState(false)

  const market = useMintMarket({ chainId: rChainId, marketId: rCollateralId })
  const marketId = market?.id ?? ''

  const formValues = useStore((state) => state.loanCreate.formValues)
  const { data: loanExists } = useLoanExists({ chainId: rChainId, marketId, userAddress: address })
  const isMdUp = useLayoutStore((state) => state.isMdUp)
  const fetchLoanDetails = useStore((state) => state.loans.fetchLoanDetails)
  const fetchUserLoanWalletBalances = useStore((state) => state.loans.fetchUserLoanWalletBalances)
  const resetUserDetailsState = useStore((state) => state.loans.resetUserDetailsState)
  const setFormValues = useStore((state) => state.loanCreate.setFormValues)
  const setStateByKeys = useStore((state) => state.loanCreate.setStateByKeys)

  const maxSlippage = useUserProfileStore((state) => state.maxSlippage.crypto)

  const isReady = !!market
  const isLeverage = rFormType === 'leverage'

  const marketDetails = useMarketDetails({ chainId: rChainId, llamma: market, llammaId: marketId })
  const network = networks[rChainId]
  const {
    data: userCollateralEvents,
    isLoading: collateralEventsIsLoading,
    isError: collateralEventsIsError,
  } = useUserCollateralEvents({
    app: 'crvusd',
    chain: isChain(network.id) ? network.id : undefined,
    controllerAddress: market?.controller as Address,
    userAddress: curve?.signerAddress,
    collateralToken: market && {
      symbol: market.collateralSymbol,
      address: market.collateral,
      decimals: market.collateralDecimals,
      name: market.collateralSymbol,
    },
    borrowToken: CRVUSD,
    network,
  })

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
    if (!isHydrated || !curve || !market) return
    resetUserDetailsState(market)
    fetchInitial(curve, isLeverage, market)
    void fetchLoanDetails(curve, market)
    setLoaded(true)
  }, [isHydrated, curve, market, resetUserDetailsState, fetchInitial, isLeverage, fetchLoanDetails])

  // redirect if loan exists
  useEffect(() => {
    if (!loaded && market && loanExists) {
      push(getLoanManagePathname(params, market.id, 'loan'))
    }
  }, [loaded, loanExists, market, params, push])

  //  redirect if form is leverage but no leverage option
  useEffect(() => {
    if (market && rFormType === 'leverage' && !hasV1Leverage(market)) {
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

  usePageVisibleInterval(() => {
    if (curve && market) {
      void fetchLoanDetails(curve, market)
    }
  }, REFRESH_INTERVAL['1m'])

  const TitleComp = () => (
    <AppPageFormTitleWrapper>
      {/** TODO: generalize or re-use existing market counting technique, see `createCountMarket` in llama-markets.ts */}
      <Title>{market?.id === 'sfrxeth2' ? 'sfrxETH v2' : getTokenName(market).collateral}</Title>
    </AppPageFormTitleWrapper>
  )

  return isHydrated && !market ? (
    <ErrorPage title="404" subtitle={t`Market Not Found`} continueUrl={getCollateralListPathname(params)} />
  ) : provider ? (
    <>
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
              {userCollateralEvents?.events && userCollateralEvents.events.length > 0 && (
                <UserPositionHistory
                  events={userCollateralEvents.events}
                  isLoading={collateralEventsIsLoading}
                  isError={collateralEventsIsError}
                />
              )}
            </Stack>
          )}
          <Stack>
            <MarketDetails {...marketDetails} />
            {<MarketInformationComp llamma={market ?? null} marketId={marketId} chainId={rChainId} page="create" />}
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

export default Page
