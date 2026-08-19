import { LEVERAGE } from '@/llamalend/constants'
import type { MarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { mapQuery, type QueryProp } from '@ui-kit/types/util'
import { borderStyle, decimal, formatNumber, formatToken } from '@ui-kit/utils'
import {
  getPriceImpactDisplay,
  getPriceImpactPercent,
  type PriceImpact,
} from '@ui-kit/widgets/DetailPageLayout/price-impact.util'
import { RouteProvidersAccordion } from '@ui-kit/widgets/RouteProvider'
import { SlippageToleranceActionInfo } from '@ui-kit/widgets/SlippageSettings'

const { Spacing } = SizesAndSpaces

/** Displays route and execution settings for LlamaLend leverage swaps. */
export const LoanActionSettings = ({
  slippage,
  onSlippageChange,
  routes,
  show = true,
  exchangeRate,
  priceImpact,
  collateralSymbol,
  borrowSymbol,
}: {
  slippage: Decimal | undefined
  onSlippageChange: (newSlippage: Decimal) => void
  routes?: MarketRoutes
  show?: boolean
  exchangeRate?: QueryProp<Decimal | null>
  priceImpact?: QueryProp<PriceImpact | Decimal | null>
  collateralSymbol?: string
  borrowSymbol?: string
}) => {
  const [isRoutesOpen, , , toggleRoutes] = useSwitch(false)
  const { label: priceImpactLabel, color: priceImpactColor } = getPriceImpactDisplay(priceImpact, {
    slippage,
    slippageType: LEVERAGE,
  })

  return (
    <Collapse in={show}>
      <Stack
        data-testid="loan-action-settings"
        sx={{ backgroundColor: t => t.design.Layer[2].Fill, border: borderStyle, padding: Spacing.xs }}
      >
        {routes && <RouteProvidersAccordion isExpanded={isRoutesOpen} onToggle={toggleRoutes} {...routes} />}
        {slippage && (
          <SlippageToleranceActionInfo
            maxSlippage={slippage}
            type={LEVERAGE}
            onChanged={({ leverage }) => onSlippageChange(leverage)}
            size="small"
          />
        )}
        {exchangeRate && collateralSymbol && borrowSymbol && (
          <ActionInfo
            label={t`Exchange rate`}
            value={mapQuery(exchangeRate, er =>
              maybe(decimal(er), er => `1 ${collateralSymbol} = ${formatToken(er, borrowSymbol, 'balance')}`),
            )}
            size="small"
            testId="borrow-exchange-rate"
          />
        )}
        {priceImpact && (
          <ActionInfo
            label={priceImpactLabel}
            value={mapQuery(priceImpact, data => formatNumber(getPriceImpactPercent(data), 'percent.rate'))}
            valueColor={priceImpactColor}
            size="small"
            testId="borrow-price-impact"
          />
        )}
        {routes?.selectedRoute && (
          <ActionInfo
            label={t`Router fee`}
            labelTooltip={{
              title: t`The total percentage of the routed amount charged as routing fees, excluding network gas costs.`,
            }}
            value={formatNumber(routes.selectedRoute.routerFeePercentage, 'percent.rate')}
            size="small"
            testId="borrow-router-fee"
          />
        )}
      </Stack>
    </Collapse>
  )
}
