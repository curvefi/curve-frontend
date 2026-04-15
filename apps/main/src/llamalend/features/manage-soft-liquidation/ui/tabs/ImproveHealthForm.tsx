import { noop } from 'lodash'
import type { ComponentProps } from 'react'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'

const onPricesUpdated = noop // disable prices chart for soft liquidation

export const ImproveHealthForm = ({ ...props }: Omit<ComponentProps<typeof RepayForm>, 'onPricesUpdated'>) => (
  <RepayForm {...props} isInSoftLiquidation onPricesUpdated={onPricesUpdated} />
)
