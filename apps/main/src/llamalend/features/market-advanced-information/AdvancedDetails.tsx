import BigNumber from 'bignumber.js'
import { MarketTypeSuffix } from '@/llamalend/constants'
import { formatCollateralNotional, getUtilizationPercent } from '@/llamalend/llama.utils'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import {
  MaxLeverageTooltip,
  SolvencyTooltip,
  TotalCollateralTooltip,
  UtilizationTooltip,
  TooltipOptions,
} from '@/llamalend/widgets/tooltips'
import Box from '@mui/material/Box'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber, FORMAT_OPTIONS } from '@ui/utils/utilsFormat'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import { abbreviateNumber, scaleSuffix } from '@ui-kit/utils/number'
import { useAdvancedDetailsData } from './hooks/useAdvancedDetailsData'

const { Spacing } = SizesAndSpaces

export type AdvancedDetailsProps = {
  chainId: number | undefined | null
  marketId: string | undefined | null
  market: LlamaMarketTemplate | undefined
  marketType: LlamaMarketType
}

const formatLiquidity = (value: number) =>
  `${formatNumber(abbreviateNumber(value), { ...FORMAT_OPTIONS.USD })}${scaleSuffix(value).toUpperCase()}`

type AvailableLiquidityValues = {
  available?: Decimal
  totalAssets?: Decimal
}

const getUtilizationMetrics = ({ available, totalAssets }: AvailableLiquidityValues) => {
  const utilization = getUtilizationPercent(available, totalAssets)
  if (utilization == null || available == null || totalAssets == null) return {}

  const availableBN = new BigNumber(available)
  const capBN = new BigNumber(totalAssets)

  return {
    utilization,
    utilizationBreakdown: `${formatLiquidity(capBN.minus(availableBN).toNumber())}/${formatLiquidity(capBN.toNumber())}`,
  }
}

export const AdvancedDetails = ({ chainId, marketId, market, marketType }: AdvancedDetailsProps) => {
  const { collateral, availableLiquidity, maxLeverage, solvency } = useAdvancedDetailsData({
    chainId,
    market,
    marketId,
    marketType,
  })
  const { utilization, utilizationBreakdown } = getUtilizationMetrics(availableLiquidity)

  return (
    <Box display="grid" gap={Spacing.lg} gridTemplateColumns={{ mobile: 'repeat(2, 1fr)', tablet: 'repeat(4, 1fr)' }}>
      <Metric
        size="small"
        label={t`Utilization`}
        value={utilization}
        loading={availableLiquidity?.loading}
        valueOptions={{ unit: 'percentage' }}
        notional={utilization != null ? utilizationBreakdown : undefined}
        valueTooltip={{
          title: t`Utilization ${MarketTypeSuffix[marketType]}`,
          body: <UtilizationTooltip marketType={marketType} />,
          ...TooltipOptions,
        }}
      />
      <Metric
        size="small"
        label={t`Total collateral`}
        value={collateral?.combinedCollateralUsdValue}
        loading={collateral?.loading}
        valueOptions={{ unit: 'dollar' }}
        notional={
          collateral?.loading
            ? undefined
            : formatCollateralNotional(
                {
                  value: collateral?.totalCollateral ?? null,
                  symbol: collateral?.collateralSymbol ?? undefined,
                },
                { value: collateral?.totalBorrowed ?? null, symbol: collateral?.borrowedSymbol ?? undefined },
              )
        }
        valueTooltip={{
          title: t`Total Collateral`,
          body: <TotalCollateralTooltip {...collateral} />,
          ...TooltipOptions,
        }}
      />
      <Metric
        size="small"
        label={t`Solvency`}
        value={solvency?.value}
        loading={solvency?.loading}
        valueOptions={{ unit: 'percentage' }}
        valueTooltip={{
          title: t`Solvency`,
          body: <SolvencyTooltip marketType={marketType} />,
          ...TooltipOptions,
        }}
      />
      {maxLeverage && (
        <Metric
          size="small"
          label={t`Max leverage`}
          value={maxLeverage?.value == null ? undefined : +maxLeverage.value}
          loading={maxLeverage?.loading}
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
