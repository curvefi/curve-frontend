import { MaxReturnOnEquity, SolvencyTooltip } from '@/llamalend/widgets/tooltips'
import { useNewLlamaMarketDetailPage } from '@evm-ui/hooks/useFeatureFlags'
import { MarketType } from '@evm-ui/types/market'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { Metric } from '@ui/components/Metric'
import { MetricsGrid } from '@ui/components/MetricsGrid'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { t } from '@ui/lib/i18n'
import { useMarketContext } from '../market-context'
import { useAdvancedDetailsData } from './hooks/useAdvancedDetailsData'
import { MarketContractsSection } from './MarketContractsSection'
import { MarketParametersSection } from './MarketParametersSection'

const { Spacing, MaxWidth } = SizesAndSpaces
const METRIC_CATEGORY = 'llamalend.marketAdvancedDetailsSummary'

const MarketInfoSections = ({
  maxLeverage,
  maxReturnOnEquity,
}: {
  maxLeverage?: QueryProp<{ value: Decimal } | { value: number }>
  maxReturnOnEquity?: QueryProp<MaxReturnOnEquity>
}) => {
  const { chainId, blockchainId, marketId, marketType, market, apiMarket, tokens } = useMarketContext()

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: Spacing.lg,
        [`@media (min-width: ${MaxWidth.candleAndBandChart})`]: { gridTemplateColumns: '1fr 1fr' },
      }}
    >
      <MarketContractsSection
        key="contracts"
        chainId={chainId}
        blockchainId={blockchainId}
        market={market}
        apiMarket={apiMarket}
      />
      <MarketParametersSection
        key="parameters"
        chainId={chainId}
        marketId={marketId}
        marketType={marketType}
        apiMarket={apiMarket}
        tokens={tokens}
        maxLeverage={maxLeverage}
        maxReturnOnEquity={maxReturnOnEquity}
      />
    </Box>
  )
}

const NewMarketInfoContent = () => {
  const { chainId, marketId, marketQuery, marketType, apiMarket } = useMarketContext()
  const { solvency, deployedDays, maxLeverage, maxReturnOnEquity } = useAdvancedDetailsData({
    chainId,
    marketQuery,
    marketId,
    marketType,
    apiMarket,
  })

  return (
    <>
      <MetricsGrid data-testid="market-advanced-details-summary">
        {solvency && (
          <Metric
            category={METRIC_CATEGORY}
            testId="market-solvency"
            label={t`Solvency`}
            value={mapQuery(solvency, ({ value }) => value)}
            valueOptions={{ unit: 'percentage' }}
            valueTooltip={{ title: t`Solvency`, body: <SolvencyTooltip type={MarketType.Lend} /> }}
          />
        )}
        <Metric
          category={METRIC_CATEGORY}
          testId="market-deployed-since"
          label={t`Deployed since`}
          value={deployedDays}
          valueOptions={{ abbreviate: false, decimals: 0, unit: { symbol: t`Days`, position: 'suffix' } }}
        />
      </MetricsGrid>
      <MarketInfoSections maxLeverage={maxLeverage} maxReturnOnEquity={maxReturnOnEquity} />
    </>
  )
}

export const MarketInfoLayout = () => (
  <Stack data-testid="market-advanced-details" sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>
    {useNewLlamaMarketDetailPage() ? <NewMarketInfoContent /> : <MarketInfoSections />}
  </Stack>
)
