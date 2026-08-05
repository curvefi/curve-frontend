import { type ChangeEvent } from 'react'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { mapQuery, type QueryProp } from '@ui-kit/types/util'
import { formatNumber } from '@ui-kit/utils'
import { CheckboxField } from '@ui-kit/widgets/DetailPageLayout/CheckboxField'

const TEST_ID_PREFIX = 'leverage'

export const LeverageInput = ({
  checked,
  leverage,
  onToggle,
  maxLeverage,
}: {
  checked: boolean | undefined
  leverage: QueryProp<Decimal | null>
  onToggle: (event: ChangeEvent<HTMLInputElement>) => void
  maxLeverage: Decimal | undefined
}) => (
  <WithSkeleton loading={leverage.isLoading} width="100%">
    <CheckboxField
      checked={!!checked}
      disabled={!maxLeverage}
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
  </WithSkeleton>
)
