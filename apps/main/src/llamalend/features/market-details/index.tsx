import { MarketBorrowRateTooltipContent } from '@/llamalend/widgets/tooltips/MarketBorrowRateTooltipContent'
import { MarketSupplyRateTooltipContent } from '@/llamalend/widgets/tooltips/MarketSupplyRateTooltipContent'
import { Box, CardHeader } from '@mui/material'
import { formatNumber, FORMAT_OPTIONS } from '@ui/utils/utilsFormat'
import type { CampaignPoolRewards } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SymbolCell } from '@ui-kit/shared/ui/SymbolCell'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType, type ExtraIncentive } from '@ui-kit/types/market'
import { abbreviateNumber, scaleSuffix } from '@ui-kit/utils/number'
import { AvailableLiquidityTooltip } from './tooltips/AvailableLiquidityTooltip'
import { CollateralTokenTooltip } from './tooltips/CollateralTokenTooltip'
import { DebtTokenTooltip } from './tooltips/DebtTokenTooltip'
import { MaxLeverageTooltip } from './tooltips/MaxLeverageTooltip'
import { TotalCollateralTooltip } from './tooltips/TotalCollateralTooltip'
import { UtilizationTooltip } from './tooltips/UtilizationTooltip'

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
type BorrowAPY = {
  rate: number | undefined | null
  averageRate: number | undefined | null
  averageRateLabel: string
  rebasingYield: number | null
  averageRebasingYield: number | null
  // total = rate - rebasingYield
  totalBorrowRate: number | null
  totalAverageBorrowRate: number | null
  extraRewards: CampaignPoolRewards[]
  loading: boolean
}
type SupplyAPY = {
  rate: number | undefined | null
  averageRate: number | undefined | null
  averageRateLabel: string
  supplyAprCrvMinBoost: number | undefined | null
  supplyAprCrvMaxBoost: number | undefined | null
  averageSupplyAprCrvMinBoost: number | undefined | null
  averageSupplyAprCrvMaxBoost: number | undefined | null
  rebasingYield: number | null
  averageRebasingYield: number | null
  // total = rate - rebasingYield + combined extra incentives + boosted (min or max) yield
  totalSupplyRateMinBoost: number | null
  totalSupplyRateMaxBoost: number | null
  totalAverageSupplyRateMinBoost: number | null
  totalAverageSupplyRateMaxBoost: number | null
  extraIncentives: ExtraIncentive[]
  averageTotalExtraIncentivesApr: number | undefined | null
  extraRewards: CampaignPoolRewards[]
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
  collateral: Collateral
  borrowToken: BorrowToken
  borrowAPY: BorrowAPY
  supplyAPY?: SupplyAPY
  availableLiquidity: AvailableLiquidity
  maxLeverage?: MaxLeverage
  blockchainId: string
  marketType: LlamaMarketType
}

const formatLiquidity = (value: number) =>
  `${formatNumber(abbreviateNumber(value), { ...FORMAT_OPTIONS.USD })}${scaleSuffix(value).toUpperCase()}`

const TooltipOptions = {
  placement: 'top',
  arrow: false,
  clickable: true,
} as const

const MarketTypeSuffix: Record<LlamaMarketType, string> = {
  [LlamaMarketType.Lend]: t`(Lending Markets)`,
  [LlamaMarketType.Mint]: t`(Mint Markets)`,
}

export const MarketDetails = ({
  collateral,
  borrowToken,
  borrowAPY,
  supplyAPY,
  availableLiquidity,
  maxLeverage,
  blockchainId,
  marketType,
}: MarketDetailsProps) => {
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
          size={'medium'}
          label={t`Borrow rate`}
          value={borrowAPY?.totalBorrowRate}
          loading={borrowAPY?.totalBorrowRate == null && borrowAPY?.loading}
          valueOptions={{ unit: 'percentage' }}
          notional={
            borrowAPY?.totalAverageBorrowRate
              ? {
                  value: borrowAPY.totalAverageBorrowRate,
                  unit: { symbol: `% ${borrowAPY.averageRateLabel} Avg`, position: 'suffix' },
                }
              : undefined
          }
          valueTooltip={{
            title: t`Borrow Rate`,
            body: (
              <MarketBorrowRateTooltipContent
                marketType={marketType}
                borrowRate={borrowAPY?.rate}
                totalBorrowRate={borrowAPY?.totalBorrowRate}
                totalAverageBorrowRate={borrowAPY?.totalAverageBorrowRate}
                averageRate={borrowAPY?.averageRate}
                periodLabel={borrowAPY?.averageRateLabel}
                extraRewards={borrowAPY?.extraRewards ?? []}
                rebasingYield={borrowAPY?.rebasingYield}
                collateralSymbol={collateral?.symbol}
                isLoading={borrowAPY?.loading}
              />
            ),
            ...TooltipOptions,
          }}
        />
        {supplyAPY && (
          <Metric
            size={'medium'}
            label={t`Supply rate`}
            value={supplyAPY?.totalSupplyRateMinBoost}
            loading={supplyAPY?.totalSupplyRateMinBoost == null && supplyAPY?.loading}
            valueOptions={{ unit: 'percentage' }}
            notional={
              supplyAPY?.averageRate
                ? {
                    value: supplyAPY.averageRate,
                    unit: { symbol: `% ${supplyAPY.averageRateLabel} Avg`, position: 'suffix' },
                  }
                : undefined
            }
            valueTooltip={{
              title: t`Supply Rate`,
              body: (
                <MarketSupplyRateTooltipContent
                  supplyRate={supplyAPY?.rate}
                  averageRate={supplyAPY?.averageRate}
                  minBoostApr={supplyAPY?.supplyAprCrvMinBoost}
                  maxBoostApr={supplyAPY?.supplyAprCrvMaxBoost}
                  totalSupplyRateMinBoost={supplyAPY?.totalSupplyRateMinBoost}
                  totalSupplyRateMaxBoost={supplyAPY?.totalSupplyRateMaxBoost}
                  totalAverageSupplyRateMinBoost={supplyAPY?.totalAverageSupplyRateMinBoost}
                  totalAverageSupplyRateMaxBoost={supplyAPY?.totalAverageSupplyRateMaxBoost}
                  rebasingYield={supplyAPY?.rebasingYield}
                  isLoading={supplyAPY?.loading}
                  periodLabel={supplyAPY?.averageRateLabel}
                  extraRewards={supplyAPY?.extraRewards ?? []}
                  extraIncentives={supplyAPY?.extraIncentives ?? []}
                />
              ),
              ...TooltipOptions,
            }}
          />
        )}
        <SymbolCell
          size={'medium'}
          label={t`Collateral`}
          symbol={collateral?.symbol}
          tokenAddress={collateral?.tokenAddress}
          loading={collateral?.total == null && collateral?.loading}
          blockchainId={blockchainId}
          valueTooltip={{
            title: t`Collateral Token`,
            body: <CollateralTokenTooltip />,
            ...TooltipOptions,
          }}
        />
        <SymbolCell
          size={'medium'}
          label={t`Debt`}
          symbol={borrowToken?.symbol}
          tokenAddress={borrowToken?.tokenAddress}
          loading={borrowToken?.symbol == null && borrowToken?.loading}
          blockchainId={blockchainId}
          valueTooltip={{
            title: t`Debt Token ${MarketTypeSuffix[marketType]}`,
            body: <DebtTokenTooltip marketType={marketType} />,
            ...TooltipOptions,
          }}
        />
        {/* Insert empty box to maintain grid layout when there is no lending APY metric */}
        {!supplyAPY && <Box />}
        <Metric
          size="small"
          label={t`Available liquidity`}
          value={availableLiquidity?.value}
          loading={availableLiquidity?.value == null && availableLiquidity?.loading}
          valueOptions={{ unit: 'dollar' }}
          valueTooltip={{
            title: t`Available Liquidity ${MarketTypeSuffix[marketType]}`,
            body: <AvailableLiquidityTooltip marketType={marketType} />,
            ...TooltipOptions,
          }}
        />
        <Metric
          size="small"
          label={t`Utilization`}
          value={utilization}
          loading={utilization == null && availableLiquidity?.loading}
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
            loading={maxLeverage?.value == null && maxLeverage?.loading}
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
