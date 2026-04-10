import { BandsComp } from '@/lend/components/BandsComp'
import { ChartAndActivityComp } from '@/lend/components/ChartAndActivityComp'
import { networks } from '@/lend/networks'
import { PageContentProps } from '@/lend/types/lend.types'
import { AdvancedDetails, MarketInfoLayout } from '@/llamalend/features/market-advanced-information'
import { MarketHistoricalRatesChart } from '@/llamalend/widgets/MarketHistoricalRatesChart'
import { MarketRateCurveChart } from '@/llamalend/widgets/MarketRateCurveChart'
import type { Chain } from '@curvefi/prices-api'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { getLib } from '@ui-kit/features/connect-wallet'
import { useNewBandsChart, useMarketHistoricalRatesChart } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { Range } from '@ui-kit/types/util'
import { PAGE_SPACING } from '@ui-kit/widgets/DetailPageLayout/constants'

const { Spacing } = SizesAndSpaces

type MarketInformationCompProps = {
  pageProps: PageContentProps
  loanExists: boolean | undefined
  type: 'borrow' | 'supply'
  previewPrices?: Range<Decimal>
  showLiquidationRange: boolean
}

/**
 * Reusable component for OHLC charts, Bands (if applicable), and market parameters, used in market and vault pages.
 */
export const MarketInformationComposite = ({ pageProps, loanExists, type, ...props }: MarketInformationCompProps) => {
  const { rChainId, rOwmId, market } = pageProps
  const api = getLib('llamaApi')
  const newBandsChartEnabled = useNewBandsChart()
  const blockchainId = networks[rChainId].id as Chain

  return (
    <Stack gap={PAGE_SPACING}>
      <ChartAndActivityComp rChainId={rChainId} rOwmId={rOwmId} api={api} {...props} />
      {type === 'borrow' && !newBandsChartEnabled && (
        <Stack sx={{ backgroundColor: (t) => t.design.Layer[1].Fill, padding: Spacing.md }}>
          <BandsComp pageProps={pageProps} loanExists={loanExists} />
        </Stack>
      )}

      {useMarketHistoricalRatesChart() && (
        <>
          <MarketHistoricalRatesChart market={market} blockchainId={blockchainId} rateMode="borrow" />
          <MarketHistoricalRatesChart market={market} blockchainId={blockchainId} rateMode="supply" />
          <MarketRateCurveChart market={market} blockchainId={blockchainId} chainId={rChainId} marketId={rOwmId} />
        </>
      )}

      {market && (
        <Card>
          <CardHeader title={t`Advanced Details`} size="small" />
          <CardContent>
            <Stack>
              <AdvancedDetails chainId={rChainId} marketId={rOwmId} market={market} marketType={LlamaMarketType.Lend} />
              <MarketInfoLayout
                chainId={rChainId}
                marketType={LlamaMarketType.Lend}
                market={market}
                network={networks[rChainId]}
              />
            </Stack>
          </CardContent>
        </Card>
      )}
    </Stack>
  )
}
