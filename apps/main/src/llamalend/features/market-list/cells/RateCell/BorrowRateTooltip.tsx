import { ReactElement } from 'react'
import { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import { MarketBorrowRateTooltipWrapper } from '@/llamalend/widgets/tooltips/MarketBorrowRateTooltipWrapper'
import { t } from '@ui-kit/lib/i18n'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'

export const BorrowRateTooltip = ({ market, children }: { market: LlamaMarket; children: ReactElement }) => (
  <Tooltip
    clickable
    title={t`Net borrow APR`}
    body={<MarketBorrowRateTooltipWrapper market={market} />}
    placement="top"
  >
    {children}
  </Tooltip>
)
