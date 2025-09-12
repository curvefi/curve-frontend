import type { UseFormReturn } from 'react-hook-form'
import { useBorrowExpectedCollateral } from '@/llamalend/widgets/borrow/queries/borrow-expected-collateral.query'
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

const { Spacing } = SizesAndSpaces

export const LeverageInput = ({
  form,
  leverageEnabled,
  params,
  maxLeverage,
}: {
  leverageEnabled: boolean
  form: UseFormReturn<BorrowForm>
  params: BorrowFormQueryParams
  maxLeverage: number | undefined
}) => {
  const { leverage } = useBorrowExpectedCollateral(params).data ?? {}

  return (
    <Stack direction="row" justifyContent="space-between" gap={Spacing.sm}>
      <FormControlLabel
        sx={{ minWidth: 180 }}
        label={
          <Stack gap={Spacing.sm}>
            <Typography variant="bodySBold">{t`Enable leverage`}</Typography>
            <WithSkeleton loading={maxLeverage == null}>
              <Typography variant="bodyXsRegular">{t`up to ${formatNumber(maxLeverage, { maximumFractionDigits: 1 })}🔥`}</Typography>
            </WithSkeleton>
          </Stack>
        }
        control={
          <Checkbox
            size="small"
            disabled={!maxLeverage}
            checked={leverageEnabled}
            onChange={(x) => form.setValue('leverageEnabled', x.target.checked)}
          />
        }
      />
      {/* todo: remove leverage for now */}
      <Input
        inputProps={{
          sx: { textAlign: 'right', paddingInline: Spacing.sm },
        }}
        sx={{ paddingInlineEnd: Spacing.sm }}
        value={formatNumber(leverage)}
        endAdornment={'x'}
        disabled
      />
    </Stack>
  )
}
