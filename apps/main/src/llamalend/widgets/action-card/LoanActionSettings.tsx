import { LEVERAGE } from '@/llamalend/constants'
import type { MarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { borderStyle } from '@ui-kit/utils'
import { RouteProvidersAccordion } from '@ui-kit/widgets/RouteProvider'
import { SlippageToleranceActionInfo } from '@ui-kit/widgets/SlippageSettings'

const { Spacing } = SizesAndSpaces

export const LoanActionSettings = ({
  slippage,
  onSlippageChange,
  routes,
  show = true,
}: {
  slippage: Decimal | undefined
  onSlippageChange: (newSlippage: Decimal) => void
  routes?: MarketRoutes
  show?: boolean
}) => {
  const [isRoutesOpen, , , toggleRoutes] = useSwitch(false)

  return (
    <Collapse in={show}>
      <Stack
        data-testid="loan-action-settings"
        sx={{ backgroundColor: t => t.design.Layer[2].Fill, border: borderStyle, padding: Spacing.xs }}
      >
        {slippage && (
          <SlippageToleranceActionInfo
            maxSlippage={slippage}
            type={LEVERAGE}
            onChanged={({ leverage }) => onSlippageChange(leverage)}
            size="small"
          />
        )}
        {routes && <RouteProvidersAccordion isExpanded={isRoutesOpen} onToggle={toggleRoutes} {...routes} />}
      </Stack>
    </Collapse>
  )
}
