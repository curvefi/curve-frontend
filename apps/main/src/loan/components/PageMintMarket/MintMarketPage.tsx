import { useMemo, useRef, useState } from 'react'
import { useConnection } from 'wagmi'
import { MarketContextProvider } from '@/llamalend/features/market-context'
import { PositionDetailsComposite } from '@/llamalend/features/market-position-details'
import { useIsInSoftLiquidation } from '@/llamalend/features/market-position-details/hooks/useUserLiquidationStatus'
import { useUserCollateralEvents } from '@/llamalend/features/user-position-history/hooks/useUserCollateralEvents'
import { useLlamaMarket } from '@/llamalend/hooks/useLlamaMarket'
import { getControllerAddress, getTokens } from '@/llamalend/llama.utils'
import { useLoanExists } from '@/llamalend/queries/user'
import { MarketBanners } from '@/llamalend/widgets/banners/MarketBanners'
import type { ChartAndActivityTab } from '@/llamalend/widgets/ChartAndActivityLayout'
import {
  MarketSection,
  MarketSectionNav,
  type MarketSectionOption,
} from '@/llamalend/widgets/market-section-nav'
import { MarketPageHeader } from '@/llamalend/widgets/page-header'
import { MarketInformationComposite } from '@/loan/components/MarketInformationComposite'
import { CreateLoanTabs } from '@/loan/components/PageMintMarket/CreateLoanTabs'
import { ManageLoanTabs } from '@/loan/components/PageMintMarket/ManageLoanTabs'
import { networks } from '@/loan/networks'
import { type CollateralUrlParams } from '@/loan/types/loan.types'
import { getChainId, getCollateralListPathname } from '@/loan/utils/utilsRouter'
import { getBlockchainId } from '@curvefi/prices-api'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { useCurve } from '@ui-kit/features/connect-wallet'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { ErrorPage } from '@ui-kit/pages/ErrorPage'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { Range } from '@ui-kit/types/util'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'
import { useMintMarket } from '../../hooks/useMintMarket'

export const MintMarketPage = () => {
  const params = useParams<CollateralUrlParams>()
  const rCollateralId = params.collateralId.toLowerCase()
  const { isInitialized } = useCurve()
  const chainId = getChainId(params)
  const { address } = useConnection()
  const [previewPrices, setPreviewPrices] = useState<Range<Decimal> | undefined>(undefined)
  const [chartAndActivityTab, setChartAndActivityTab] = useState<ChartAndActivityTab>('chart')
  const positionDetailsRef = useRef<HTMLElement | null>(null)
  const chartAndActivityRef = useRef<HTMLElement | null>(null)
  const historicalRatesRef = useRef<HTMLElement | null>(null)
  const advancedDetailsRef = useRef<HTMLElement | null>(null)
  const faqsRef = useRef<HTMLElement | null>(null)

  const marketQuery = useMintMarket({ chainId, rMarket: rCollateralId })
  const { data: market, isLoading: isMarketLoading, error: marketError } = marketQuery

  const queryParams = { chainId, marketId: market?.id, userAddress: address }
  const { data: loanExists, isLoading: isLoanExistsLoading } = useLoanExists(queryParams)

  const network = networks[chainId]
  const isLoading = !isInitialized || isMarketLoading
  const apiMarket = useLlamaMarket(
    {
      network: params.network,
      rMarket: rCollateralId,
      userAddress: address,
      enableDeprecatedMarkets: useUserProfileStore(state => state.showDeprecatedMarkets),
    },
    !isLoading && !market,
  )
  const tokens = useMemo(() => getTokens(market, apiMarket.data) ?? {}, [apiMarket.data, market])
  const controllerAddress = getControllerAddress(market, apiMarket.data)

  const collateralEvents = useUserCollateralEvents({
    app: LlamaMarketType.Mint,
    chain: getBlockchainId(network.id),
    controllerAddress,
    userAddress: address,
    network,
    tokens,
  })
  const { data: isSoftLiquidation, isLoading: isSoftLiquidationLoading } = useIsInSoftLiquidation(
    queryParams,
    !!loanExists,
  )

  const error = marketError ?? apiMarket.error
  const sectionRefs = {
    chartAndActivity: chartAndActivityRef,
    historicalRates: historicalRatesRef,
    advancedDetails: advancedDetailsRef,
    faqs: faqsRef,
  }
  const sections: MarketSectionOption[] = [
    { value: 'position-details', label: t`Position Details`, ref: positionDetailsRef },
    {
      value: 'price-chart',
      label: t`Price Chart`,
      ref: chartAndActivityRef,
      onClick: () => setChartAndActivityTab('chart'),
    },
    {
      value: 'market-activity',
      label: t`Market Activity`,
      ref: chartAndActivityRef,
      onClick: () => setChartAndActivityTab('events'),
    },
    { value: 'historical-rates', label: t`Historical Rates`, ref: historicalRatesRef },
    { value: 'advanced-details', label: t`Advanced Details`, ref: advancedDetailsRef },
    { value: 'faqs', label: t`FAQs`, ref: faqsRef },
  ]

  return error ? (
    <ErrorPage
      title={t`Error`}
      subtitle={error.message}
      error={error}
      continueUrl={getCollateralListPathname(params)}
    />
  ) : (
    <MarketContextProvider
      network={network}
      marketQuery={marketQuery}
      apiMarket={apiMarket}
      marketType={LlamaMarketType.Mint}
    >
      <DetailPageLayout
        formTabs={
          !isLoading &&
          !isLoanExistsLoading &&
          !isSoftLiquidationLoading &&
          (loanExists ? (
            <ManageLoanTabs
              onPricesUpdated={setPreviewPrices}
              collateralEvents={collateralEvents}
              isSoftLiquidation={!!isSoftLiquidation}
            />
          ) : (
            <CreateLoanTabs onPricesUpdated={setPreviewPrices} />
          ))
        }
        header={
          <Stack>
            <MarketPageHeader isLoading={isLoading} />
            <MarketSectionNav sections={sections} />
          </Stack>
        }
      >
        <MarketBanners chainId={chainId} market={market} />
        <MarketSection id="position-details" sectionRef={positionDetailsRef}>
          <PositionDetailsComposite hasPosition={loanExists} events={collateralEvents} />
        </MarketSection>
        <MarketInformationComposite
          previewPrices={previewPrices}
          sectionRefs={sectionRefs}
          chartAndActivityTab={chartAndActivityTab}
          onChartAndActivityTabChange={setChartAndActivityTab}
        />
      </DetailPageLayout>
    </MarketContextProvider>
  )
}
