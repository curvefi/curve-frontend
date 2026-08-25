import { type ChangeEvent } from 'react'
import { t } from '@evm-ui/lib/i18n'
import { ActionInfo } from '@evm-ui/shared/ui/ActionInfo'
import { WithSkeleton } from '@evm-ui/shared/ui/WithSkeleton'
import { mapQuery, type QueryProp } from '@evm-ui/types/util'
import { formatNumber } from '@evm-ui/utils'
import { CheckboxField } from '@evm-ui/widgets/DetailPageLayout/CheckboxField'
import type { Decimal } from '@primitives/decimal.utils'
import { maybe } from '@primitives/objects.utils'

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
