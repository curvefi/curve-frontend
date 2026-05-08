import { type ChangeEvent } from 'react'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import type { QueryProp } from '@ui-kit/types/util'
import { CheckboxField } from '@ui-kit/widgets/DetailPageLayout/CheckboxField'

const TEST_ID_PREFIX = 'leverage'

export const LeverageInput = ({
  checked,
  leverage: { data: leverage, error: leverageError, isLoading: isLeverageLoading },
  onToggle,
  maxLeverage,
}: {
  checked: boolean | undefined
  leverage: QueryProp<Decimal | null>
  onToggle: (event: ChangeEvent<HTMLInputElement>) => void
  maxLeverage: Decimal | undefined
}) => (
  <WithSkeleton loading={checked == null} width="100%">
    <CheckboxField
      checked={!!checked}
      disabled={!maxLeverage}
      label={t`Enable leverage`}
      testIdPrefix={TEST_ID_PREFIX}
      onChange={onToggle}
      endContent={
        <ActionInfo
          label={t`Leverage`}
          value={leverage == null ? '–' : `${formatNumber(leverage, { maximumFractionDigits: 2 })}x`}
          valueColor={leverageError ? 'error' : undefined}
          loading={isLeverageLoading}
          error={leverageError}
          size="medium"
          data-testid={`${TEST_ID_PREFIX}-value`}
        />
      }
    />
  </WithSkeleton>
)
