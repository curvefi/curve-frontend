import { CardHeader, Box } from '@mui/material'
import { formatNumber, FORMAT_OPTIONS } from '@ui/utils/utilsFormat'
import { t } from '@ui-kit/lib/i18n'
import { SymbolCell } from '@ui-kit/shared/ui/MarketDetails/SymbolCell'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { abbreviateNumber, scaleSuffix } from '@ui-kit/utils/number'

const { Spacing } = SizesAndSpaces

type Collateral = {
  total: number | undefined | null
  totalUsdValue: number | undefined | null
  symbol: string | undefined | null
  tokenAddress: string | undefined | null
  usdRate: number | undefined | null
  loading: boolean
}
type BorrowToken = {
  total?: number | undefined | null
  totalUsdValue?: number | undefined | null
  symbol: string | undefined | null
  tokenAddress: string | undefined | null
  usdRate: number | undefined | null
  loading: boolean
}
type BorrowAPR = {
  value: number | undefined | null
  thirtyDayAvgRate: number | undefined | null
  loading: boolean
}
type LendingAPY = {
  value: number | undefined | null
  thirtyDayAvgRate: number | undefined | null
  loading: boolean
}
type AvailableLiquidity = {
  value: number | undefined | null
  max: number | undefined | null
  loading: boolean
}
type MaxLeverage = {
  value: number | undefined | null
  loading: boolean
}

export type MarketDetailsProps = {
  /**
   * Use true if Market Details appear on the top of the page, the upper row will have larger cells
   */
  marketPage: boolean
  collateral: Collateral
  borrowToken: BorrowToken
  borrowAPR: BorrowAPR
  lendingAPY?: LendingAPY
  availableLiquidity: AvailableLiquidity
  maxLeverage?: MaxLeverage
}

const formatLiquidity = (value: number) =>
  `${formatNumber(abbreviateNumber(value), { ...FORMAT_OPTIONS.USD })}${scaleSuffix(value).toUpperCase()}`

export const MarketDetails = ({
  marketPage = false,
  collateral,
  borrowToken,
  borrowAPR,
  lendingAPY,
  availableLiquidity,
  maxLeverage,
}: MarketDetailsProps) => {
  const utilization =
    availableLiquidity?.value && availableLiquidity.max
      ? (availableLiquidity.value / availableLiquidity.max) * 100
      : undefined
  const utilizationBreakdown =
    availableLiquidity?.value && availableLiquidity.max
      ? `${formatLiquidity(availableLiquidity.value)}/${formatLiquidity(availableLiquidity.max)}`
      : undefined

  return (
    <Box sx={{ backgroundColor: (t) => t.design.Layer[1].Fill }}>
      <CardHeader title={t`Market Details`} size={marketPage ? 'medium' : 'small'} />
      <Box display="grid" gridTemplateColumns="1fr 1fr 1fr 1fr" gap={5} sx={{ padding: Spacing.md }}>
        <Metric
          size={marketPage ? 'medium' : 'small'}
          label={t`Borrow APR`}
          value={borrowAPR?.value}
          loading={borrowAPR?.value == null && borrowAPR?.loading}
          valueOptions={{ unit: 'percentage' }}
          notional={
            borrowAPR?.thirtyDayAvgRate
              ? {
                  value: borrowAPR.thirtyDayAvgRate,
                  unit: { symbol: '% 30D Avg', position: 'suffix' },
                }
              : undefined
          }
        />
        {lendingAPY && (
          <Metric
            size={marketPage ? 'medium' : 'small'}
            label={t`Lending APY`}
            value={lendingAPY?.value}
            loading={lendingAPY?.value == null && lendingAPY?.loading}
            valueOptions={{ unit: 'percentage' }}
            notional={
              lendingAPY?.thirtyDayAvgRate
                ? {
                    value: lendingAPY.thirtyDayAvgRate,
                    unit: { symbol: '% 30D Avg', position: 'suffix' },
                  }
                : undefined
            }
          />
        )}
        <SymbolCell
          size={marketPage ? 'medium' : 'small'}
          label={t`Collateral`}
          symbol={collateral?.symbol}
          tokenAddress={collateral?.tokenAddress}
          loading={collateral?.total == null && collateral?.loading}
        />
        <SymbolCell
          size={marketPage ? 'medium' : 'small'}
          label={t`Debt`}
          symbol={borrowToken?.symbol}
          tokenAddress={borrowToken?.tokenAddress}
          loading={borrowToken?.symbol == null && borrowToken?.loading}
        />
        {/* Insert empty box to maintain grid layout when there is no lending APY metric */}
        {!lendingAPY && <Box />}
        <Metric
          size="small"
          label={t`Available liquidity`}
          value={availableLiquidity?.value}
          loading={availableLiquidity?.value == null && availableLiquidity?.loading}
          valueOptions={{ unit: 'dollar' }}
        />
        <Metric
          size="small"
          label={t`Utilization`}
          value={utilization}
          loading={utilization == null && availableLiquidity?.loading}
          valueOptions={{ unit: 'percentage' }}
          notional={utilization ? utilizationBreakdown : undefined}
        />
        <Metric
          size="small"
          label={t`Total collateral`}
          value={collateral?.total}
          loading={collateral?.total == null && collateral?.loading}
          valueOptions={{ unit: { symbol: collateral?.symbol ?? '', position: 'suffix' } }}
          notional={
            collateral?.totalUsdValue
              ? {
                  value: collateral.totalUsdValue,
                  unit: 'dollar',
                }
              : undefined
          }
        />
        {maxLeverage && (
          <Metric
            size="small"
            label={t`Max leverage`}
            value={maxLeverage?.value}
            loading={maxLeverage?.value == null && maxLeverage?.loading}
            valueOptions={{ unit: 'multiplier' }}
          />
        )}
      </Box>
    </Box>
  )
}
