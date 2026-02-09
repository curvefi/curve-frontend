import { Box, CardHeader } from '@mui/material'
import { formatNumber, FORMAT_OPTIONS } from '@ui/utils/utilsFormat'
import type { CampaignPoolRewards } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType, type ExtraIncentive } from '@ui-kit/types/market'
import { abbreviateNumber, scaleSuffix } from '@ui-kit/utils/number'
import { MarketTypeSuffix, MaxLeverageTooltip, TotalCollateralTooltip, UtilizationTooltip, TooltipOptions } from './'

const { Spacing } = SizesAndSpaces

type Collateral = {
  total: number | undefined | null
  totalUsdValue: number | undefined | null
  symbol: string | undefined | null
  tokenAddress: string | undefined | null
  usdRate: number | undefined | null
  loading: boolean
}
export type BorrowRate = {
  rate: number | undefined | null
  averageRate: number | undefined | null
  averageRateLabel: string
  rebasingYield: number | null | undefined
  averageRebasingYield: number | null | undefined
  // total = rate - rebasingYield
  totalBorrowRate: number | null | undefined
  totalAverageBorrowRate: number | null | undefined
  extraRewards: CampaignPoolRewards[]
  loading: boolean
}
export type SupplyRate = {
  rate: number | undefined | null
  averageRate: number | undefined | null
  averageRateLabel: string
  supplyAprCrvMinBoost: number | undefined | null
  supplyAprCrvMaxBoost: number | undefined | null
  averageSupplyAprCrvMinBoost: number | undefined | null
  averageSupplyAprCrvMaxBoost: number | undefined | null
  rebasingYield: number | null | undefined
  averageRebasingYield: number | null | undefined
  // total = rate - rebasingYield + combined extra incentives + boosted (min or max) yield
  totalSupplyRateMinBoost: number | null | undefined
  totalSupplyRateMaxBoost: number | null | undefined
  totalAverageSupplyRateMinBoost: number | null | undefined
  totalAverageSupplyRateMaxBoost: number | null | undefined
  extraIncentives: ExtraIncentive[]
  averageTotalExtraIncentivesApr: number | undefined | null
  extraRewards: CampaignPoolRewards[]
  loading: boolean
}
export type AvailableLiquidity = {
  value: number | undefined | null
  max: number | undefined | null
  loading: boolean
}
type MaxLeverage = {
  value: number | undefined | null
  loading: boolean
}

export type MarketDetailsProps = {
  collateral: Collateral
  borrowRate: BorrowRate
  supplyRate?: SupplyRate
  availableLiquidity: AvailableLiquidity
  maxLeverage?: MaxLeverage
  blockchainId: string
  marketType: LlamaMarketType
}

const formatLiquidity = (value: number) =>
  `${formatNumber(abbreviateNumber(value), { ...FORMAT_OPTIONS.USD })}${scaleSuffix(value).toUpperCase()}`

export const MarketDetails = ({ collateral, availableLiquidity, maxLeverage, marketType }: MarketDetailsProps) => {
  const utilization =
    availableLiquidity?.value && availableLiquidity.max
      ? ((availableLiquidity.max - availableLiquidity.value) / availableLiquidity.max) * 100
      : undefined
  const utilizationBreakdown =
    availableLiquidity?.value && availableLiquidity.max
      ? `${formatLiquidity(availableLiquidity.max - availableLiquidity.value)}/${formatLiquidity(availableLiquidity.max)}`
      : undefined

  return (
    <Box sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
      <CardHeader title={t`Market Details`} size={'small'} />
      <Box
        display="grid"
        gap={3}
        sx={{
          padding: Spacing.md,
          gridTemplateColumns: '1fr 1fr',
          // 550px
          '@media (min-width: 33.125rem)': {
            gridTemplateColumns: '1fr 1fr 1fr 1fr',
          },
        }}
      >
        <Metric
          size="small"
          label={t`Utilization`}
          value={utilization}
          loading={availableLiquidity?.loading}
          valueOptions={{ unit: 'percentage' }}
          notional={utilization ? utilizationBreakdown : undefined}
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
            value={maxLeverage?.value}
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
