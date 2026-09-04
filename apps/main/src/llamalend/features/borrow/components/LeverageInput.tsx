import { type ChangeEvent } from 'react'
import { ActionInfo } from '@evm-ui/shared/ui/ActionInfo'
import { formatNumber } from '@evm-ui/utils'
import { CheckboxField } from '@evm-ui/widgets/DetailPageLayout/CheckboxField'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

const TEST_ID_PREFIX = 'leverage'

export const LeverageInput = ({
  checked,
  leverage,
  onToggle,
}: {
  checked: boolean | undefined
  leverage: QueryProp<Decimal | null>
  onToggle: (event: ChangeEvent<HTMLInputElement>) => void
}) => (
  <CheckboxField
    checked={!!checked}
    label={t`Enable leverage`}
    testIdPrefix={TEST_ID_PREFIX}
    onChange={onToggle}
    endContent={
      <ActionInfo
        label={t`Leverage`}
        value={mapQuery(leverage, v => formatNumber(maybe(v, Number) && v, 'multiplier'))}
        size="medium"
        data-testid={`${TEST_ID_PREFIX}-value`}
      />
    }
  />
)
