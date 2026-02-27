import { useEffect, useState } from 'react'
import { useConnection } from 'wagmi'
import { MarketDetails } from '@/llamalend/features/market-details'
import { PositionDetailsComp, useBorrowPositionDetails } from '@/llamalend/features/market-position-details'
import type { UserCollateralEventsProps } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { useLoanExists } from '@/llamalend/queries/user'
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
import { isChain, type Chain } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { ConnectWalletPrompt, useCurve } from '@ui-kit/features/connect-wallet'
import { useParams } from '@ui-kit/hooks/router'
import { useIntegratedLlamaHeader } from '@ui-kit/hooks/useFeatureFlags'
import { usePageVisibleInterval } from '@ui-kit/hooks/usePageVisibleInterval'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { Range } from '@ui-kit/types/util'
import { CRVUSD } from '@ui-kit/utils/address'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'

export const MintMarketPage = () => {
  const params = useParams<CollateralUrlParams>()
  const rCollateralId = params.collateralId.toLowerCase()
  const { llamaApi: curve = null, isHydrated, provider } = useCurve()
  const rChainId = useChainId(params)
  const { address } = useConnection()
  const [loaded, setLoaded] = useState(false)
  const [previewPrices, setPreviewPrices] = useState<Range<Decimal> | undefined>(undefined)

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
  const activityQueryParams: UserCollateralEventsProps = {
    app: LlamaMarketType.Mint,
    chain: isChain(network.id) ? network.id : undefined,
    controllerAddress: market?.controller as Address | undefined,
    userAddress: curve?.signerAddress,
    collateralToken: market
      ? {
          symbol: market.collateralSymbol,
          address: market.collateral,
          decimals: market.collateralDecimals,
          name: market.collateralSymbol,
        }
      : undefined,
    borrowToken: CRVUSD,
    network,
  }
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
    onPricesUpdated: setPreviewPrices,
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
        <PositionDetailsComp
          hasPosition={loanExists}
          borrowPositionDetails={borrowPositionDetails}
          activityQueryParams={activityQueryParams}
        />
        <Stack>
          {!showPageHeader && <MarketDetails {...marketDetails} />}
          <MarketInformationComp
            market={market ?? null}
            marketId={marketId}
            chainId={rChainId}
            page="manage"
            previewPrices={previewPrices}
          />
        </Stack>
      </DetailPageLayout>
    </>
  ) : (
    <ConnectWalletPrompt description={t`Connect your wallet to view market`} />
  )
}
