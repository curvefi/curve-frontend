import { BORROW_APR_DESCRIPTION, NET_BORROW_APR_DESCRIPTION } from '@/llamalend/constants'
import { TooltipDescription, TooltipWrapper } from '@ui/components/TooltipComponents'

export const BorrowAprHeaderTooltipContent = () => (
  <TooltipWrapper>
    <TooltipDescription text={BORROW_APR_DESCRIPTION} />
    <TooltipDescription text={NET_BORROW_APR_DESCRIPTION} />
  </TooltipWrapper>
)
