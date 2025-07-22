import { CardHeader, Box } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type LendingAPY = {
  value: number | undefined | null
  maxApy: number | undefined | null
  thirtyDayAvgRate: number | undefined | null
  loading: boolean
}
type Shares = {
  value: number | undefined | null
  staked: number | undefined | null
  loading: boolean
}

// TODO: figure out where to find boost data and add
type Boost = {
  value: number | undefined | null
  loading: boolean
}
type LentAsset = {
  symbol: string | undefined | null
  address: string | undefined | null
  usdRate: number | undefined | null
  depositedAmount: number | undefined | null
  depositedUsdValue: number | undefined | null
  loading: boolean
}

export type LendPositionDetailsProps = {
  lendingAPY: LendingAPY
  shares: Shares
  lentAsset: LentAsset
}

export const LendPositionDetails = ({ lendingAPY, shares, lentAsset }: LendPositionDetailsProps) => (
  <Box>
    <CardHeader title={t`Lending Information`} size="small" />
    <Box display="grid" gridTemplateColumns="1fr 1fr 1fr 1fr" gap={3} sx={{ padding: Spacing.md }}>
      <Metric
        size="medium"
        label={t`Supply rate`}
        value={lendingAPY?.value}
        loading={lendingAPY?.value == null && lendingAPY?.loading}
        valueOptions={{ unit: 'percentage', color: 'warning' }}
        notional={lendingAPY?.maxApy ? `max Boost ${lendingAPY.maxApy.toFixed(1)}%` : undefined}
      />
      <Metric
        size="medium"
        label={t`Amount supplied`}
        value={lentAsset?.depositedAmount}
        loading={lentAsset?.depositedAmount == null && lentAsset?.loading}
        valueOptions={{ unit: 'dollar' }}
        notional={
          lentAsset?.depositedAmount
            ? {
                value: lentAsset.depositedAmount,
                unit: { symbol: ` ${lentAsset.symbol}`, position: 'suffix' },
              }
            : undefined
        }
      />
      <Metric
        size="medium"
        label={t`Vault shares`}
        value={shares?.value}
        loading={shares?.value == null && shares?.loading}
        valueOptions={{}}
        notional={
          shares.staked && shares.value
            ? {
                value: (shares.staked / shares.value) * 100,
                unit: { symbol: '%', position: 'suffix' },
              }
            : undefined
        }
      />
    </Box>
  </Box>
)
