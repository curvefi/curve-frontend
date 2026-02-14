import { Box, CardHeader } from '@mui/material'
import { formatNumber, FORMAT_OPTIONS } from '@ui/utils/utilsFormat'
import { useIntegratedLlamaHeader } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SymbolCell } from '@ui-kit/shared/ui/SymbolCell'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
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
  type MarketDetailsProps,
} from './'

const { Spacing, MaxWidth } = SizesAndSpaces

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
  const showPageHeader = useIntegratedLlamaHeader()
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
          [`@media (min-width: ${MaxWidth.legacyMarketAndBorrowDetails})`]: {
            gridTemplateColumns: '1fr 1fr 1fr 1fr',
          },
        }}
      >
        {!showPageHeader && (
          <Metric
            size={'medium'}
            label={t`Borrow APR`}
            value={borrowRate?.rate}
            loading={borrowRate?.loading}
            valueOptions={{ unit: 'percentage' }}
            notional={
              borrowRate?.averageRate
                ? {
                    value: borrowRate.averageRate,
                    unit: { symbol: `% ${borrowRate.averageRateLabel} Avg`, position: 'suffix' },
                  }
                : undefined
            }
            valueTooltip={{
              title: t`Borrow APR`,
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
        )}
        {!showPageHeader && supplyRate && (
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
        {!showPageHeader && (
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
        )}
        {!showPageHeader && (
          <SymbolCell
            size={'medium'}
            label={t`Debt`}
            symbol={borrowToken?.symbol}
            tokenAddress={borrowToken?.tokenAddress}
            loading={borrowToken?.loading ?? false}
            blockchainId={blockchainId}
            valueTooltip={{
              title: t`Debt Token ${MarketTypeSuffix[marketType]}`,
              body: <DebtTokenTooltip marketType={marketType} />,
              ...TooltipOptions,
            }}
          />
        )}
        {/* Insert empty box to maintain grid layout when there is no lending APY metric */}
        {!showPageHeader && !supplyRate && <Box />}
        {!showPageHeader && (
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
        )}
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
