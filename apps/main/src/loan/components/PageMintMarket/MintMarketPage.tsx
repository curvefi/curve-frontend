import { useEffect, useState } from 'react'
import { Address } from 'viem'
import { useConnection } from 'wagmi'
import { MarketDetails } from '@/llamalend/features/market-details'
import {
  BorrowPositionDetails,
  LlamaMonitorBotLinkButton,
  NoPosition,
  useBorrowPositionDetails,
} from '@/llamalend/features/market-position-details'
import { UserPositionHistory } from '@/llamalend/features/user-position-history'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { useLoanExists } from '@/llamalend/queries/loan-exists'
import { PageHeader } from '@/llamalend/widgets/page-header'
import { MarketInformationComp } from '@/loan/components/MarketInformationComp'
import { CreateLoanTabs } from '@/loan/components/PageMintMarket/CreateLoanTabs'
import { ManageLoanTabs } from '@/loan/components/PageMintMarket/ManageLoanTabs'
import { useMintMarket } from '@/loan/entities/mint-markets'
import { useMarketDetails } from '@/loan/hooks/useMarketDetails'
import { useUserLoanDetails } from '@/loan/hooks/useUserLoanDetails'
import { networks } from '@/loan/networks'
import { useStore } from '@/loan/store/useStore'
import { type CollateralUrlParams } from '@/loan/types/loan.types'
import { getCollateralListPathname, useChainId } from '@/loan/utils/utilsRouter'
import { isChain } from '@curvefi/prices-api'
import type { Chain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import { ConnectWalletPrompt, useCurve } from '@ui-kit/features/connect-wallet'
import { useParams } from '@ui-kit/hooks/router'
import { useIntegratedLlamaHeader } from '@ui-kit/hooks/useFeatureFlags'
import { usePageVisibleInterval } from '@ui-kit/hooks/usePageVisibleInterval'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import { CRVUSD } from '@ui-kit/utils/address'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'

const { Spacing } = SizesAndSpaces

export const MintMarketPage = () => {
  const params = useParams<CollateralUrlParams>()
  const rCollateralId = params.collateralId.toLowerCase()
  const { llamaApi: curve = null, isHydrated, provider } = useCurve()
  const rChainId = useChainId(params)
  const { address } = useConnection()
  const [loaded, setLoaded] = useState(false)

  const market = useMintMarket({ chainId: rChainId, marketId: rCollateralId })
  const marketId = market?.id ?? ''

  const { data: loanExists } = useLoanExists({ chainId: rChainId, marketId, userAddress: address })
  const fetchLoanDetails = useStore((state) => state.loans.fetchLoanDetails)

  const loanStatus = useUserLoanDetails(market?.id ?? '')?.userStatus?.colorKey ?? ''
  const marketDetails = useMarketDetails({ chainId: rChainId, market, marketId })
  const network = networks[rChainId]
  const borrowPositionDetails = useBorrowPositionDetails({
    marketType: LlamaMarketType.Mint,
    chainId: rChainId,
    marketId,
    blockchainId: network.id as Chain,
    market: market ?? null,
  })
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
    if (isHydrated && curve && market) {
      void (async () => {
        await fetchLoanDetails(curve, market)
        setLoaded(true)
      })()
    }
  }, [isHydrated, curve, market, fetchLoanDetails])

  usePageVisibleInterval(async () => {
    if (curve?.signerAddress && market && loanExists) {
      await fetchLoanDetails(curve, market)
    }
  }, REFRESH_INTERVAL['1m'])

  const formProps = {
    curve,
    isReady: !!curve?.signerAddress && !!market,
    market: market ?? null,
    rChainId,
    params,
  }
  const showPageHeader = useIntegratedLlamaHeader()

  const isLoading = !loaded || (loanExists && !loanStatus)
  return isHydrated && !market ? (
    <ErrorPage title="404" subtitle={t`Market Not Found`} continueUrl={getCollateralListPathname(params)} />
  ) : provider ? (
    <>
      {showPageHeader && (
        <PageHeader
          isLoading={!isHydrated}
          market={market}
          blockchainId={network.id as Chain}
          availableLiquidity={marketDetails.availableLiquidity}
          borrowRate={marketDetails.borrowRate}
        />
      )}
      <DetailPageLayout
        formTabs={
          !isLoading &&
          (loanExists ? (
            <ManageLoanTabs {...formProps} isInSoftLiquidation={loanStatus !== 'healthy'} />
          ) : (
            <CreateLoanTabs {...formProps} />
          ))
        }
      >
        <Stack>
          {showPageHeader && (
            <Stack alignItems="center" direction="row" justifyContent="flex-end">
              <LlamaMonitorBotLinkButton />
            </Stack>
          )}
          <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
            {loanExists ? <BorrowPositionDetails {...borrowPositionDetails} /> : <NoPosition type="borrow" />}
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
        </Stack>
        <Stack>
          {!showPageHeader && <MarketDetails {...marketDetails} />}
          <MarketInformationComp market={market ?? null} marketId={marketId} chainId={rChainId} page="manage" />
        </Stack>
      </DetailPageLayout>
    </>
  ) : (
    <ConnectWalletPrompt description={t`Connect your wallet to view market`} />
  )
}
