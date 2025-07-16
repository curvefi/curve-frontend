import { CardHeader, Box } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { SymbolCell } from '@ui-kit/shared/ui/MarketDetails/SymbolCell'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type LendingAPY = {
  value: number | undefined | null
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
    <CardHeader title={t`Your Position Details`} />
    <Box>
      <CardHeader title={t`Supply Information`} size="small" />
      <Box display="grid" gridTemplateColumns="1fr 1fr 1fr 1fr 1fr" gap={5} sx={{ padding: Spacing.md }}>
        <Metric
          size="small"
          label={t`Lending APY`}
          value={lendingAPY?.value}
          loading={lendingAPY?.value == null && lendingAPY?.loading}
          valueOptions={{ unit: 'percentage', color: 'warning' }}
          notional={
            lendingAPY?.thirtyDayAvgRate
              ? {
                  value: lendingAPY.thirtyDayAvgRate,
                  unit: { symbol: '% 30D Avg', position: 'suffix' },
                }
              : undefined
          }
        />
        <Metric
          size="small"
          label={t`Shares staked`}
          value={shares.staked && shares.value ? (shares.staked / shares.value) * 100 : null}
          loading={shares?.value == null && shares?.loading}
          valueOptions={{ unit: 'percentage' }}
        />
        <SymbolCell
          label={t`Lent asset`}
          symbol={lentAsset?.symbol}
          tokenAddress={lentAsset?.address}
          loading={lentAsset?.loading}
          size="small"
        />
        <Metric
          size="small"
          label={t`Amount deposited`}
          value={lentAsset?.depositedAmount}
          loading={lentAsset?.depositedAmount == null && lentAsset?.loading}
          valueOptions={{ unit: 'dollar' }}
        />
        <Metric
          size="small"
          label={t`Vault shares`}
          value={shares?.value}
          loading={shares?.value == null && shares?.loading}
          valueOptions={{}}
        />
      </Box>
    </Box>
  </Box>
)
