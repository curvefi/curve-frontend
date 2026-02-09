import { Box, CardHeader } from '@mui/material'
import { formatNumber, FORMAT_OPTIONS } from '@ui/utils/utilsFormat'
import type { CampaignPoolRewards } from '@ui-kit/entities/campaigns'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SymbolCell } from '@ui-kit/shared/ui/SymbolCell'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { LlamaMarketType, type ExtraIncentive } from '@ui-kit/types/market'
import { abbreviateNumber, scaleSuffix } from '@ui-kit/utils/number'
import {
  MarketTypeSuffix,
  AvailableLiquidityTooltip,
  CollateralTokenTooltip,
  DebtTokenTooltip,
  MaxLeverageTooltip,
  TotalCollateralTooltip,
  UtilizationTooltip,
  MarketNetBorrowAprTooltipContent,
  MarketSupplyRateTooltipContent,
  TooltipOptions,
} from './'

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
  borrowToken: BorrowToken
  borrowRate: BorrowRate
  supplyRate?: SupplyRate
  availableLiquidity: AvailableLiquidity
  maxLeverage?: MaxLeverage
  blockchainId: string
  marketType: LlamaMarketType
}

const formatLiquidity = (value: number) =>
  `${formatNumber(abbreviateNumber(value), { ...FORMAT_OPTIONS.USD })}${scaleSuffix(value).toUpperCase()}`

export const MarketDetails = ({
  collateral,
  borrowToken,
  borrowRate,
  supplyRate,
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
          label={t`Net borrow APR`}
          value={borrowRate?.totalBorrowRate}
          loading={borrowRate?.loading}
          valueOptions={{ unit: 'percentage' }}
          notional={
            borrowRate?.totalAverageBorrowRate
              ? {
                  value: borrowRate.totalAverageBorrowRate,
                  unit: { symbol: `% ${borrowRate.averageRateLabel} Avg`, position: 'suffix' },
                }
              : undefined
          }
          valueTooltip={{
            title: t`Net borrow APR`,
            body: (
              <MarketNetBorrowAprTooltipContent
                marketType={marketType}
                borrowRate={borrowRate?.rate}
                totalBorrowRate={borrowRate?.totalBorrowRate}
                totalAverageBorrowRate={borrowRate?.totalAverageBorrowRate}
                averageRate={borrowRate?.averageRate}
                periodLabel={borrowRate?.averageRateLabel}
                extraRewards={borrowRate?.extraRewards ?? []}
                rebasingYield={borrowRate?.rebasingYield}
                collateralSymbol={collateral?.symbol}
                isLoading={borrowRate?.loading}
              />
            ),
            ...TooltipOptions,
          }}
        />
        {supplyRate && (
          <Metric
            size={'medium'}
            label={t`Supply rate`}
            value={supplyRate?.totalSupplyRateMinBoost}
            loading={supplyRate?.loading}
            valueOptions={{ unit: 'percentage' }}
            notional={
              supplyRate?.averageRate
                ? {
                    value: supplyRate.averageRate,
                    unit: { symbol: `% ${supplyRate.averageRateLabel} Avg`, position: 'suffix' },
                  }
                : undefined
            }
            valueTooltip={{
              title: t`Supply Rate`,
              body: (
                <MarketSupplyRateTooltipContent
                  supplyRate={supplyRate?.rate}
                  averageRate={supplyRate?.averageRate}
                  minBoostApr={supplyRate?.supplyAprCrvMinBoost}
                  maxBoostApr={supplyRate?.supplyAprCrvMaxBoost}
                  totalSupplyRateMinBoost={supplyRate?.totalSupplyRateMinBoost}
                  totalSupplyRateMaxBoost={supplyRate?.totalSupplyRateMaxBoost}
                  totalAverageSupplyRateMinBoost={supplyRate?.totalAverageSupplyRateMinBoost}
                  totalAverageSupplyRateMaxBoost={supplyRate?.totalAverageSupplyRateMaxBoost}
                  rebasingYield={supplyRate?.rebasingYield}
                  isLoading={supplyRate?.loading}
                  periodLabel={supplyRate?.averageRateLabel}
                  extraRewards={supplyRate?.extraRewards ?? []}
                  extraIncentives={supplyRate?.extraIncentives ?? []}
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
          loading={collateral?.loading}
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
          loading={borrowToken?.loading}
          blockchainId={blockchainId}
          valueTooltip={{
            title: t`Debt Token ${MarketTypeSuffix[marketType]}`,
            body: <DebtTokenTooltip marketType={marketType} />,
            ...TooltipOptions,
          }}
        />
        {/* Insert empty box to maintain grid layout when there is no lending APY metric */}
        {!supplyRate && <Box />}
        <Metric
          size="small"
          label={t`Available liquidity`}
          value={availableLiquidity?.value}
          loading={availableLiquidity?.loading}
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
