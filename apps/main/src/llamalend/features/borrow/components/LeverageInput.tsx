import type { UseFormReturn } from 'react-hook-form'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Input from '@mui/material/Input'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { WithSkeleton } from '@ui-kit/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { BorrowForm, BorrowFormQueryParams } from '../borrow.types'
import { useBorrowExpectedCollateral } from '../queries/borrow-expected-collateral.query'

const { Spacing } = SizesAndSpaces

export const LeverageInput = ({
  form,
  leverageEnabled,
  params,
  maxLeverage,
  isError,
  isLoading,
}: {
  leverageEnabled: boolean
  form: UseFormReturn<BorrowForm>
  params: BorrowFormQueryParams
  maxLeverage: number | undefined
  isError: boolean
  isLoading: boolean
}) => {
  const { leverage } = useBorrowExpectedCollateral(params).data ?? {}

  return (
    <Stack direction="row" justifyContent="space-between" gap={Spacing.sm}>
      <FormControlLabel
        sx={{ minWidth: 180 }}
        label={
          <Stack gap={Spacing.sm}>
            <Typography variant="bodySBold">{t`Enable leverage`}</Typography>
            <WithSkeleton loading={isLoading}>
              <Typography
                {...(isError && { color: 'error.main' })}
                variant="bodyXsRegular"
              >{t`up to ${formatNumber(maxLeverage, { maximumFractionDigits: 1 })}🔥`}</Typography>
            </WithSkeleton>
          </Stack>
        }
        control={
          <Checkbox
            data-testid="leverage-checkbox"
            size="small"
            disabled={!maxLeverage}
            checked={leverageEnabled}
            onChange={(x) => form.setValue('leverageEnabled', x.target.checked)}
          />
        }
      />
      <Input
        inputProps={{
          sx: { textAlign: 'right', paddingInline: Spacing.sm },
        }}
        sx={{ paddingInlineEnd: Spacing.sm }}
        value={formatNumber(leverage)}
        endAdornment={'x'}
        disabled
        error={isError}
      />
    </Stack>
  )
}
