import { noop } from 'lodash'
import type { ComponentProps } from 'react'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'

/**
 * Form to repay debt to increase health in soft liquidation. Similar to RepayForm, but with some differences:
 * - No token selection, since only the borrow token can be repaid to increase health
 * - No price impact or swap info, since no swap is involved in improving health
 * - Different info list component that focuses on health improvement details rather than general repay details
 */
export const ImproveHealthForm = ({ ...props }: Omit<ComponentProps<typeof RepayForm>, 'onPricesUpdated'>) => (
  <RepayForm
    {...props}
    isInSoftLiquidation
    onPricesUpdated={noop} // disable prices chart for soft liquidation
  />
)
