import type { UseFormReturn } from 'react-hook-form/dist/types'
import Checkbox from '@mui/material/Checkbox'
import FormControlLabel from '@mui/material/FormControlLabel'
import Input from '@mui/material/Input'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { BorrowForm } from '../borrow.types'

const { Spacing } = SizesAndSpaces

const setOptionalNumber = (val: string) => (val ? +val : undefined)

export const LeverageInput = ({
  maxLeverage,
  leverage,
  form,
}: {
  maxLeverage: number | undefined
  leverage: number | undefined
  form: UseFormReturn<BorrowForm>
}) => (
  <Stack direction="row" justifyContent="space-between" gap={Spacing.sm}>
    <FormControlLabel
      sx={{ minWidth: 180, '& p': { textTransform: 'none' } }}
      label={
        <Stack gap={Spacing.sm}>
          <Typography variant="bodySBold">{t`Enable leverage`}</Typography>
          <Typography variant="bodyXsRegular">{t`up to ${formatNumber(maxLeverage, { maximumFractionDigits: 1 })}🔥`}</Typography>
        </Stack>
      }
      control={
        <Checkbox
          size="small"
          checked={!!leverage}
          onChange={(x) => form.setValue('leverage', x.target.checked ? 1 : undefined)}
        />
      }
    />
    <Input
      inputProps={{
        sx: { textAlign: 'right', paddingInline: Spacing.sm },
      }}
      sx={{ paddingInlineEnd: Spacing.sm }}
      {...form.register('leverage', { setValueAs: setOptionalNumber, min: 1, max: maxLeverage })}
      endAdornment={'x'}
    />
  </Stack>
)
