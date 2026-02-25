import BigNumber from 'bignumber.js'
import {
  MarketTypeSuffix,
  MaxLeverageTooltip,
  TotalCollateralTooltip,
  UtilizationTooltip,
  TooltipOptions,
} from '@/llamalend/features/market-details'
import type { LlamaMarketTemplate } from '@/llamalend/llamalend.types'
import { Box, CardHeader } from '@mui/material'
import { formatNumber, FORMAT_OPTIONS } from '@ui/utils/utilsFormat'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType } from '@ui-kit/types/market'
import type { Decimal } from '@ui-kit/utils'
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
  cap?: Decimal
}

const getUtilizationMetrics = ({ available, cap }: AvailableLiquidityValues) => {
  if (available == null || cap == null) return {}

  const availableBN = new BigNumber(available)
  const capBN = new BigNumber(cap)
  if (capBN.isZero()) return {}

  const usedLiquidity = capBN.minus(availableBN)
  const utilization = usedLiquidity.div(capBN).times(100).toNumber()

  return {
    utilization,
    utilizationBreakdown: `${formatLiquidity(usedLiquidity.toNumber())}/${formatLiquidity(capBN.toNumber())}`,
  }
}

export const AdvancedDetails = ({ chainId, marketId, market, marketType }: AdvancedDetailsProps) => {
  const { collateral, availableLiquidity, maxLeverage } = useAdvancedDetailsData({
    chainId,
    market,
    marketId,
    marketType,
  })
  const { utilization, utilizationBreakdown } = getUtilizationMetrics(availableLiquidity)

  return (
    <Box sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
      <CardHeader title={t`Advanced Details`} size={'small'} />
      <Box
        display="grid"
        gap={3}
        sx={{
          padding: Spacing.md,
          gridTemplateColumns: { mobile: 'repeat(2, 1fr)', tablet: 'repeat(4, 1fr)' },
        }}
      >
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
          value={collateral?.total}
          loading={collateral?.loading}
          valueOptions={{ unit: { symbol: collateral?.symbol ?? '', position: 'suffix' } }}
          notional={
            collateral?.totalUsdValue
              ? {
                  value: collateral.totalUsdValue,
                  unit: 'dollar',
                }
              : undefined
          }
          valueTooltip={{
            title: t`Total Collateral`,
            body: <TotalCollateralTooltip />,
            ...TooltipOptions,
          }}
        />
        {maxLeverage && (
          <Metric
            size="small"
            label={t`Max leverage`}
            value={maxLeverage?.value ? +maxLeverage?.value : undefined}
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
    </Box>
  )
}
