import { type ChangeEvent } from 'react'
import { getLeverageValueColor } from '@/llamalend/features/market-position-details/market-position-details.utils'
import { formatLeverage } from '@/llamalend/widgets/action-card/info-actions.helpers'
import type { Decimal } from '@primitives/decimal.utils'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { CheckboxField } from '@ui/features/forms/controls/CheckboxField'
import { mapQuery, type QueryProp } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

const TEST_ID_PREFIX = 'leverage'

export const LeverageInput = ({
  checked,
  leverage,
  onToggle,
}: {
  checked: boolean | undefined
  /** null hides the value */
  leverage: QueryProp<Decimal | null> | null
  onToggle: (event: ChangeEvent<HTMLInputElement>) => void
}) => (
  <CheckboxField
    checked={!!checked}
    label={t`Enable leverage`}
    testIdPrefix={TEST_ID_PREFIX}
    onChange={onToggle}
    endContent={
      leverage && (
        <ActionInfo
          label={t`Leverage`}
          value={mapQuery(leverage, formatLeverage)}
          valueColor={getLeverageValueColor(leverage.data)}
          size="medium"
          data-testid={`${TEST_ID_PREFIX}-value`}
        />
      )
    }
  />
)
