import { type ChangeEvent } from 'react'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import type { QueryProp } from '@ui-kit/types/util'
import { CheckboxField } from '@ui-kit/widgets/DetailPageLayout/CheckboxField'

const TEST_ID_PREFIX = 'leverage'

export const LeverageInput = ({
  checked,
  leverageValue: { data: leverage, error: leverageError, isLoading: isLeverageLoading },
  onToggle,
  maxLeverage,
}: {
  checked: boolean
  leverageValue: QueryProp<Decimal>
  onToggle: (event: ChangeEvent<HTMLInputElement>) => void
  maxLeverage: Decimal | undefined
}) => (
  <CheckboxField
    checked={checked}
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
)
