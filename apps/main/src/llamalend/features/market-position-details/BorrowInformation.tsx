import { NetBorrowAprMetric } from '@/llamalend/widgets/NetBorrowAprMetric'
import { CollateralMetricTooltipContent } from '@/llamalend/widgets/tooltips/CollateralMetricTooltipContent'
import { CurrentLTVTooltipContent } from '@/llamalend/widgets/tooltips/CurrentLTVTooltipContent'
import { TotalDebtTooltipContent } from '@/llamalend/widgets/tooltips/TotalDebtTooltipContent'
import { Stack } from '@mui/material'
import { useIntegratedLlamaHeader } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { LlamaMarketType } from '@ui-kit/types/market'
import { formatNumber } from '@ui-kit/utils'
import { TooltipOptions } from '../market-details/tooltips'
import {
  LiquidationThresholdTooltipContent,
  type BorrowRate,
  type Leverage,
  type CollateralValue,
  type Ltv,
  type TotalDebt,
  type LiquidationRange,
  type BandRange,
} from './'

const { MaxWidth } = SizesAndSpaces

const dollarUnitOptions = {
  abbreviate: false,
  unit: {
    symbol: '$',
    position: 'prefix' as const,
    abbreviate: false,
  },
}

type BorrowInformationProps = {
  marketType: LlamaMarketType
  borrowRate: BorrowRate | undefined | null
  collateralValue: CollateralValue | undefined | null
  ltv: Ltv | undefined | null
  leverage: Leverage | undefined | null
  liquidationRange: LiquidationRange | undefined | null
  bandRange: BandRange | undefined | null
  totalDebt: TotalDebt | undefined | null
}

export const BorrowInformation = ({
  marketType,
  borrowRate,
  collateralValue,
  ltv,
  leverage,
  liquidationRange,
  bandRange,
  totalDebt,
}: BorrowInformationProps) => {
  const showPageHeader = useIntegratedLlamaHeader()

  return (
    <Stack>
      <Stack
        display="grid"
        gap={3}
        sx={{
          gridTemplateColumns: '1fr 1fr',
          [`@media (min-width: ${MaxWidth.legacyMarketAndBorrowDetails})`]: {
            gridTemplateColumns: showPageHeader ? '1fr 1fr' : '1fr 1fr 1fr 1fr',
          },
        }}
      >
        {showPageHeader ? (
          <>
            <Metric
              size="small"
              label={t`Collateral value`}
              value={collateralValue?.totalValue}
              loading={collateralValue?.loading}
              valueOptions={{ unit: 'dollar' }}
              notional={
                collateralValue?.collateral?.value != null
                  ? `${formatNumber(collateralValue.collateral.value, { abbreviate: true })} ${collateralValue.collateral.symbol}${collateralValue.borrow?.value != null && collateralValue.borrow.value > 0 ? ` + ${formatNumber(collateralValue.borrow.value, { abbreviate: true })} ${collateralValue.borrow.symbol}` : ''}`
                  : undefined
              }
              valueTooltip={{
                title: t`Collateral value`,
                body: <CollateralMetricTooltipContent collateralValue={collateralValue} />,
                placement: 'top',
                arrow: false,
                clickable: true,
              }}
            />
            <Metric
              size="small"
              label={t`Liquidation threshold`}
              value={liquidationRange?.value?.[1]}
              loading={liquidationRange?.loading}
              valueOptions={dollarUnitOptions}
              valueTooltip={{
                title: t`Liquidation Threshold (LT)`,
                body: (
                  <LiquidationThresholdTooltipContent
                    liquidationRange={liquidationRange}
                    rangeToLiquidation={liquidationRange?.rangeToLiquidation}
                    bandRange={bandRange}
                  />
                ),
                placement: 'top',
                arrow: false,
                clickable: true,
              }}
              notional={
                liquidationRange?.rangeToLiquidation
                  ? {
                      value: liquidationRange.rangeToLiquidation,
                      unit: {
                        symbol: `% distance to LT`,
                        position: 'suffix',
                      },
                    }
                  : undefined
              }
            />
            <Metric
              size="small"
              label={t`Total debt`}
              value={totalDebt?.value}
              loading={totalDebt?.loading}
              valueOptions={{ unit: { symbol: 'crvUSD', position: 'suffix' } }}
              valueTooltip={{
                title: t`Total Debt`,
                body: <TotalDebtTooltipContent />,
                placement: 'top',
                arrow: false,
                clickable: true,
              }}
            />
            {leverage?.value != null &&
              leverage?.value > 1 && ( // Leverage is only available on lend for now
                <Metric
                  size="small"
                  label={t`Leverage`}
                  value={leverage?.value}
                  loading={leverage?.loading}
                  valueOptions={{ unit: 'multiplier' }}
                />
              )}
          </>
        ) : (
          <>
            <NetBorrowAprMetric
              marketType={marketType}
              borrowRate={borrowRate}
              collateralSymbol={collateralValue?.collateral?.symbol}
              size="medium"
              tooltipOptions={TooltipOptions}
            />
            <Metric
              size="medium"
              label={t`Total debt`}
              value={totalDebt?.value}
              loading={totalDebt?.loading}
              valueOptions={{ unit: { symbol: 'crvUSD', position: 'suffix' } }}
              valueTooltip={{
                title: t`Total Debt`,
                body: <TotalDebtTooltipContent />,
                placement: 'top',
                arrow: false,
                clickable: true,
              }}
            />
            <Metric
              size="medium"
              label={t`Collateral value`}
              value={collateralValue?.totalValue}
              loading={collateralValue?.loading}
              valueOptions={{ unit: 'dollar' }}
              notional={
                collateralValue?.collateral?.value != null
                  ? `${formatNumber(collateralValue.collateral.value, { abbreviate: true })} ${collateralValue.collateral.symbol}${collateralValue.borrow?.value != null && collateralValue.borrow.value > 0 ? ` + ${formatNumber(collateralValue.borrow.value, { abbreviate: true })} ${collateralValue.borrow.symbol}` : ''}`
                  : undefined
              }
              valueTooltip={{
                title: t`Collateral value`,
                body: <CollateralMetricTooltipContent collateralValue={collateralValue} />,
                placement: 'top',
                arrow: false,
                clickable: true,
              }}
            />
            <Metric
              size="medium"
              label={t`Current LTV`}
              value={ltv?.value}
              loading={ltv?.loading}
              valueOptions={{ unit: 'percentage' }}
              valueTooltip={{
                title: t`Current LTV (Loan To Value ratio)`,
                body: <CurrentLTVTooltipContent />,
                placement: 'top',
                arrow: false,
                clickable: true,
              }}
            />
            {leverage?.value != null &&
              leverage?.value > 1 && ( // Leverage is only available on lend for now
                <Metric
                  size="small"
                  label={t`Leverage`}
                  value={leverage?.value}
                  loading={leverage?.loading}
                  valueOptions={{ unit: 'multiplier' }}
                />
              )}
            <Metric
              size="small"
              label={t`Liquidation threshold`}
              value={liquidationRange?.value?.[1]}
              loading={liquidationRange?.loading}
              valueOptions={dollarUnitOptions}
              valueTooltip={{
                title: t`Liquidation Threshold (LT)`,
                body: (
                  <LiquidationThresholdTooltipContent
                    liquidationRange={liquidationRange}
                    rangeToLiquidation={liquidationRange?.rangeToLiquidation}
                    bandRange={bandRange}
                  />
                ),
                placement: 'top',
                arrow: false,
                clickable: true,
              }}
              notional={
                liquidationRange?.rangeToLiquidation
                  ? {
                      value: liquidationRange.rangeToLiquidation,
                      unit: {
                        symbol: `% distance to LT`,
                        position: 'suffix',
                      },
                    }
                  : undefined
              }
            />
          </>
        )}
      </Stack>
    </Stack>
  )
}
