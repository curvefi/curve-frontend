import { LEVERAGE } from '@/llamalend/constants'
import type { MarketRoutes } from '@/llamalend/hooks/useMarketRoutes'
import { useSwitch } from '@evm-ui/hooks/useSwitch'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import { borderStyle } from '@evm-ui/utils'
import { RouteProvidersAccordion } from '@evm-ui/widgets/RouteProvider'
import { SlippageToleranceActionInfo } from '@evm-ui/widgets/SlippageSettings'
import Collapse from '@mui/material/Collapse'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'

const { Spacing } = SizesAndSpaces

export const LoanActionSettings = ({
  slippage,
  onSlippageChange,
  routes,
  show = true,
}: {
  slippage?: Decimal
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
