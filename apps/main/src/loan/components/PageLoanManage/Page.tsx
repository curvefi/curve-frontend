import { useEffect, useState } from 'react'
import { Address } from 'viem'
import { ManageSoftLiquidation } from '@/llamalend/features/manage-soft-liquidation'
import { MarketDetails } from '@/llamalend/features/market-details'
import { BorrowPositionDetails, NoPosition } from '@/llamalend/features/market-position-details'
import { UserPositionHistory } from '@/llamalend/features/user-position-history'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { useLoanExists } from '@/llamalend/queries/loan-exists'
import { DetailPageStack } from '@/llamalend/widgets/DetailPageStack'
import { MarketInformationComp } from '@/loan/components/MarketInformationComp'
import LoanMange from '@/loan/components/PageLoanManage/index'
import type { FormType } from '@/loan/components/PageLoanManage/types'
import { useMintMarket } from '@/loan/entities/mint-markets'
import { useLoanPositionDetails } from '@/loan/hooks/useLoanPositionDetails'
import { useMarketDetails } from '@/loan/hooks/useMarketDetails'
import { useUserLoanDetails } from '@/loan/hooks/useUserLoanDetails'
import networks from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import type { CollateralUrlParams } from '@/loan/types/loan.types'
import { hasDeleverage } from '@/loan/utils/leverage'
import { getLoanCreatePathname, parseCollateralParams, useChainId } from '@/loan/utils/utilsRouter'
import { isChain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import { AppPageFormsWrapper } from '@ui/AppPage'
import Box from '@ui/Box'
import { ConnectWalletPrompt, isLoading, useConnection, useWallet } from '@ui-kit/features/connect-wallet'
import { useWagmiConnection as useWagmiConnection } from '@ui-kit/features/connect-wallet/lib/wagmi/hooks'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useNavigate, useParams } from '@ui-kit/hooks/router'
import { useManageSoftLiquidation } from '@ui-kit/hooks/useFeatureFlags'
import usePageVisibleInterval from '@ui-kit/hooks/usePageVisibleInterval'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { CRVUSD } from '@ui-kit/utils/address'

const { Spacing } = SizesAndSpaces

const Page = () => {
  const params = useParams<CollateralUrlParams>()
  const { rFormType, rCollateralId } = parseCollateralParams(params)
  const push = useNavigate()
  const { connectState, llamaApi: curve = null, isHydrated } = useConnection()
  const rChainId = useChainId(params)
  const { address } = useWagmiConnection()

  const market = useMintMarket({ chainId: rChainId, marketId: rCollateralId })
  const marketId = market?.id ?? ''

  const isMdUp = useLayoutStore((state) => state.isMdUp)
  const { data: loanExists } = useLoanExists({ chainId: rChainId, marketId, userAddress: address })
  const fetchLoanDetails = useStore((state) => state.loans.fetchLoanDetails)
  const fetchUserLoanDetails = useStore((state) => state.loans.fetchUserLoanDetails)
  const resetUserDetailsState = useStore((state) => state.loans.resetUserDetailsState)
  const { provider, connect: connectWallet } = useWallet()

  const loanStatus = useUserLoanDetails(market?.id ?? '')?.userStatus?.colorKey ?? ''
  const isManageSoftLiq = useManageSoftLiquidation() && loanStatus !== 'healthy' && loanStatus !== ''
  const [loaded, setLoaded] = useState(false)

  const isValidRouterParams = !!rChainId && !!rCollateralId && !!rFormType
  const isReady = !!curve?.signerAddress && !!market

  const marketDetails = useMarketDetails({ chainId: rChainId, llamma: market, llammaId: marketId })
  const positionDetails = useLoanPositionDetails({
    chainId: rChainId,
    llamma: market,
    llammaId: marketId,
  })

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

  useEffect(() => {
    if (isHydrated && curve && rCollateralId && market) {
      void (async () => {
        const fetchedLoanDetails = await fetchLoanDetails(curve, market)
        if (!fetchedLoanDetails.loanExists) {
          resetUserDetailsState(market)
          push(getLoanCreatePathname(params, rCollateralId))
        }
        setLoaded(true)
      })()
    }
  }, [
    isReady,
    isHydrated,
    rFormType,
    curve,
    rCollateralId,
    market,
    fetchLoanDetails,
    resetUserDetailsState,
    push,
    params,
  ])

  //  redirect if form is deleverage but no deleverage option
  useEffect(() => {
    if (market && rFormType === 'deleverage' && !hasDeleverage(market)) {
      push(getLoanCreatePathname(params, market.id))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loaded, rFormType, market])

  usePageVisibleInterval(() => {
    if (curve?.signerAddress && market && loanExists) {
      void fetchLoanDetails(curve, market)
      void fetchUserLoanDetails(curve, market)
    }
  }, REFRESH_INTERVAL['1m'])

  const formProps = {
    curve,
    isReady: !!curve?.signerAddress && !!market,
    llamma: market ?? null,
    llammaId: marketId,
    rChainId,
  }

  return provider ? (
    <>
      <DetailPageStack>
        <AppPageFormsWrapper>
          {isManageSoftLiq && <ManageSoftLiquidation marketId={marketId} chainId={rChainId} network={network} />}
          {isValidRouterParams && !isManageSoftLiq && (
            <LoanMange
              {...formProps}
              params={params}
              rChainId={rChainId}
              rCollateralId={rCollateralId}
              rFormType={rFormType as FormType}
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
            {<MarketInformationComp llamma={market ?? null} marketId={marketId} chainId={rChainId} page="manage" />}
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

export default Page
