import { type ChangeEvent, useCallback } from 'react'
import type { UseFormReturn } from 'react-hook-form'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { Query } from '@ui-kit/types/util'
import { Decimal } from '@ui-kit/utils'
import { useCreateLoanExpectedCollateral } from '../../../queries/create-loan/create-loan-expected-collateral.query'
import type { CreateLoanForm, CreateLoanFormQueryParams } from '../types'

const { Spacing } = SizesAndSpaces

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
    <Stack direction="row" justifyContent="space-between" gap={Spacing.sm} alignItems="start" flexWrap="wrap">
      <FormControlLabel
        sx={{ minWidth: 180 }}
        label={
          <>
            <Typography variant="headingXsBold">{t`Enable leverage`}</Typography>
            <WithSkeleton loading={isLoading}>
              <Typography {...(error && { color: 'error.main' })} variant="bodyXsRegular">
                {`${t`up to`} ${formatNumber(maxLeverage, { maximumFractionDigits: 1 })}x 🔥`}
              </Typography>
            </WithSkeleton>
          </>
        }
        control={
          <Checkbox
            data-testid="leverage-checkbox"
            size="small"
            disabled={!maxLeverage}
            checked={checked}
            onChange={onLeverageChanged}
            sx={{ padding: 0, paddingInlineEnd: Spacing.xs, alignSelf: 'start' }}
          />
        }
      />
      <ActionInfo
        label={t`Leverage`}
        value={leverage == null ? '–' : `${formatNumber(leverage, { maximumFractionDigits: 2 })}x`}
        valueColor={error ? 'error' : undefined}
        loading={isLoading}
        error={error}
        size="medium"
        data-testid="leverage-value"
      />
    </Stack>
  )
}
