import { LEVERAGE } from '@/llamalend/constants'
import type { MarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import { formatToken } from '@evm-ui/utils/tokens'
import { RouteProvidersAccordion } from '@evm-ui/widgets/RouteProvider'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { PriceImpactActionInfo } from '@ui/features/forms/action-info/PriceImpactActionInfo'
import { SlippageToleranceActionInfo } from '@ui/features/forms/slippage/SlippageToleranceActionInfo'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useSwitch } from '@ui/hooks/useSwitch'
import { decimal } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'
import { borderStyle } from '@ui/lib/mui'
import { getPriceImpactPercent, type PriceImpact } from '@ui/lib/price-impact.util'

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
  userAddress,
}: {
  slippage?: Decimal
  onSlippageChange: (newSlippage: Decimal) => void
  routes?: MarketRoutes
  show?: boolean
  exchangeRate?: QueryProp<Decimal | null>
  priceImpact?: QueryProp<PriceImpact | Decimal | null>
  collateralSymbol?: string
  borrowSymbol?: string
  userAddress: Address | undefined
}) => {
  const [isRoutesOpen, , , toggleRoutes] = useSwitch(false)

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
            userAddress={userAddress}
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
          <PriceImpactActionInfo
            priceImpact={priceImpact}
            value={mapQuery(priceImpact, data => formatNumber(getPriceImpactPercent(data), 'percent.price-impact'))}
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
