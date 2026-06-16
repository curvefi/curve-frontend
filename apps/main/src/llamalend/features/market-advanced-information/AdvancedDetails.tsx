import { formatCollateralNotional } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import {
  MaxLeverageTooltip,
  SolvencyTooltip,
  TotalCollateralTooltip,
  TooltipOptions,
} from '@/llamalend/widgets/tooltips'
import Box from '@mui/material/Box'
import { maybe } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import { mapQuery } from '@ui-kit/types/util'
import { decimal } from '@ui-kit/utils'
import { useAdvancedDetailsData } from './hooks/useAdvancedDetailsData'

const { Spacing } = SizesAndSpaces

type AdvancedDetailsProps = {
  chainId: number | undefined | null
  marketId: string | undefined | null
  market: LlamaMarketTemplate | undefined
  marketType: LlamaMarketType
}

export const AdvancedDetails = ({ chainId, marketId, market, marketType }: AdvancedDetailsProps) => {
  const { collateral, availableLiquidity, maxLeverage, solvency, totalBorrowers, averageHealth } =
    useAdvancedDetailsData({
      chainId,
      market,
      marketId,
      marketType,
    })
  const isLendMarket = marketType === LlamaMarketType.Lend

  return (
    <Box
      sx={{
        display: 'grid',
        gap: Spacing.lg,
        gridTemplateColumns: { mobile: 'repeat(2, 1fr)', tablet: 'repeat(4, 1fr)', desktop: 'repeat(6, 1fr)' },
      }}
    >
      {availableLiquidity.data?.borrowCap && (
        <Metric
          size="medium"
          label={t`Borrow cap`}
          value={mapQuery(availableLiquidity, ({ borrowCap }) => borrowCap)}
          valueOptions={{ abbreviate: true }}
        />
      )}
      <Metric
        size="medium"
        label={t`Total borrowers`}
        value={mapQuery(totalBorrowers, ({ value }) => value)}
        valueOptions={{ abbreviate: true }}
      />
      <Metric
        size="medium"
        label={t`Average health`}
        value={mapQuery(averageHealth, ({ value }) => value)}
        valueOptions={{ decimals: 1 }}
      />
      {/* we show total collateral in the rate curve card for lend markets */}
      {!isLendMarket && (
        <Metric
          size="medium"
          label={t`Total collateral`}
          value={mapQuery(collateral, ({ combinedCollateralUsdValue }) => combinedCollateralUsdValue)}
          valueOptions={{ unit: 'dollar' }}
          notional={maybe(collateral.data, ({ borrowedSymbol, collateralSymbol, totalBorrowed, totalCollateral }) =>
            formatCollateralNotional(
              { value: decimal(totalCollateral), symbol: collateralSymbol },
              { value: decimal(totalBorrowed), symbol: borrowedSymbol },
            ),
          )}
          valueTooltip={{
            title: t`Total Collateral`,
            body: <TotalCollateralTooltip {...collateral.data} />,
            ...TooltipOptions,
          }}
        />
      )}
      {solvency && (
        <Metric
          size="medium"
          label={t`Solvency`}
          value={mapQuery(solvency, ({ value }) => value)}
          valueOptions={{ unit: 'percentage' }}
          valueTooltip={{
            title: t`Solvency`,
            body: <SolvencyTooltip type={marketType} />,
            ...TooltipOptions,
          }}
        />
      )}
      {maxLeverage && (
        <Metric
          size="medium"
          label={t`Max leverage`}
          value={mapQuery(maxLeverage, ({ value }) => value)}
          valueOptions={{ unit: 'multiplier' }}
          valueTooltip={{
            title: t`Maximum Leverage`,
            body: <MaxLeverageTooltip />,
            ...TooltipOptions,
          }}
        />
      )}
    </Box>
  )
}
