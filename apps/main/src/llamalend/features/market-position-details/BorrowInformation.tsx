import { formatCollateralNotional, isLeveragedPosition } from '@/llamalend/llama.utils'
import { CollateralMetricTooltipContent } from '@/llamalend/widgets/tooltips/CollateralMetricTooltipContent'
import { TotalDebtTooltipContent } from '@/llamalend/widgets/tooltips/TotalDebtTooltipContent'
import { Stack } from '@mui/material'
import { t } from '@ui-kit/lib/i18n'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import {
  LiquidationThresholdTooltipContent,
  type Leverage,
  type CollateralValue,
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
  collateralValue: CollateralValue | undefined | null
  leverage: Leverage | undefined | null
  liquidationRange: LiquidationRange | undefined | null
  bandRange: BandRange | undefined | null
  totalDebt: TotalDebt | undefined | null
}

export const BorrowInformation = ({
  collateralValue,
  leverage,
  liquidationRange,
  bandRange,
  totalDebt,
}: BorrowInformationProps) => (
  <Stack>
    <Stack
      display="grid"
      gap={3}
      sx={{
        gridTemplateColumns: '1fr 1fr',
        [`@media (min-width: ${MaxWidth.legacyMarketAndBorrowDetails})`]: { gridTemplateColumns: '1fr 1fr' },
      }}
    >
      <Metric
        size="small"
        label={t`Collateral value`}
        value={collateralValue?.totalValue}
        loading={collateralValue?.loading}
        valueOptions={{ unit: 'dollar' }}
        notional={
          collateralValue?.collateral
            ? formatCollateralNotional(collateralValue.collateral, collateralValue.borrow)
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
      {leverage?.value != null && isLeveragedPosition(leverage.value) && (
        <Metric
          size="small"
          label={t`Leverage`}
          value={leverage?.value}
          loading={leverage?.loading}
          valueOptions={{ unit: 'multiplier' }}
        />
      )}
    </Stack>
  </Stack>
)
