import { type ChangeEvent, useCallback } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import type { Query } from '@ui-kit/types/util'
import { Decimal } from '@ui-kit/utils'
import { FormCheckbox } from '@ui-kit/widgets/DetailPageLayout/FormCheckbox'
import { useCreateLoanExpectedCollateral } from '../../../queries/create-loan/create-loan-expected-collateral.query'
import type { CreateLoanForm, CreateLoanFormQueryParams } from '../types'

const TEST_ID_PREFIX = 'leverage'

export const LeverageInput = ({
  form,
  checked,
  params,
  maxLeverage: { data: maxLeverage, error, isLoading },
}: {
  checked: boolean
  form: UseFormReturn<CreateLoanForm>
  params: CreateLoanFormQueryParams
  maxLeverage: Query<Decimal>
}) => {
  const { leverage } = useCreateLoanExpectedCollateral(params).data ?? {}

  const onLeverageChanged = useCallback(
    (x: ChangeEvent<HTMLInputElement>) => form.setValue('leverageEnabled', x.target.checked),
    [form],
  )
  return (
    <FormCheckbox
      checked={checked}
      disabled={!maxLeverage}
      label={t`Enable leverage`}
      message={`${t`up to`} ${formatNumber(maxLeverage, { maximumFractionDigits: 1 })}x 🔥`}
      isLoading={isLoading}
      error={error}
      testIdPrefix={TEST_ID_PREFIX}
      onChange={onLeverageChanged}
      rightChildren={
        <ActionInfo
          label={t`Leverage`}
          value={leverage == null ? '–' : `${formatNumber(leverage, { maximumFractionDigits: 2 })}x`}
          valueColor={error ? 'error' : undefined}
          loading={isLoading}
          error={error}
          size="medium"
          data-testid={`${TEST_ID_PREFIX}-value`}
        />
      }
    />
  )
}
