import { MarketAdvancedDetails, MarketInfoLayout } from '@/llamalend/features/market-advanced-information'
import { MarketFaq } from '@/llamalend/features/market-faq'
import { CrvUsdPriceChart } from '@/llamalend/widgets/CrvUsdPriceChart'
import { MarketCardHeader } from '@/llamalend/widgets/MarketCardHeader'
import { MarketHistoricalRatesChart } from '@/llamalend/widgets/MarketHistoricalRatesChart'
import { ChartAndActivityComp } from '@/loan/components/ChartAndActivityComp'
import type { ChainId } from '@/loan/types/loan.types'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { useNewLlamaMarketDetailPage } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { MarketRateType } from '@ui-kit/types/market'
import type { Range } from '@ui-kit/types/util'
import { PAGE_SPACING } from '@ui-kit/widgets/DetailPageLayout/constants'
import { useMarketContext } from '../../llamalend/features/market-context'
import { networks } from '../networks'

type MarketInformationCompProps = {
  previewPrices: Range<Decimal> | undefined
}

export const MarketInformationComposite = ({ previewPrices }: MarketInformationCompProps) => {
  const { chainId } = useMarketContext<ChainId>()
  const isNewLlamaMarketDetailPage = useNewLlamaMarketDetailPage()
  const Header = isNewLlamaMarketDetailPage ? MarketCardHeader : CardHeader

  return (
    <Stack sx={{ gap: PAGE_SPACING }}>
      <ChartAndActivityComp previewPrices={previewPrices} />
      <MarketHistoricalRatesChart rateMode={MarketRateType.Borrow} />
      <CrvUsdPriceChart />
      <Card size="small" data-testid="market-parameters-card">
        <Header title={t`Advanced Details`} />
        <CardContent component={Stack}>
          {!isNewLlamaMarketDetailPage && <MarketAdvancedDetails />}
          <MarketInfoLayout network={networks[chainId]} />
        </CardContent>
      </Card>
      <MarketFaq />
    </Stack>
  )
}
