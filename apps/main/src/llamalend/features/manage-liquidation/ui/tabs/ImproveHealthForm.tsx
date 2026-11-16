import { noop } from 'lodash'
import type { ComponentProps } from 'react'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import { useNewLlamalendHealth } from '@evm-ui/hooks/useFeatureFlags'
import { t } from '@ui/lib/i18n'

const onPricesUpdated = noop // disable prices chart for soft liquidation

export const ImproveHealthForm = ({ ...props }: Omit<ComponentProps<typeof RepayForm>, 'onPricesUpdated'>) => (
  <RepayForm {...props} isInSoftLiquidation onPricesUpdated={onPricesUpdated} />
)

export const ImproveHealthTabLabel = () => (useNewLlamalendHealth() ? t`Refill buffer` : t`Improve health`)
