import type { Decimal } from '@primitives/decimal.utils'
import { Transparent } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { NumericTextField } from '../NumericTextField'

type BalanceTextFieldProps = {
  balance: Decimal | undefined
  isError: boolean
  disabled?: boolean
  /** Callback fired when the numeric value changes, can be a temporary non decimal value like "5." or "-" */
  onChange: (balance: string | undefined) => void
  name: string
}

export const BalanceTextField = ({ balance, name, isError, onChange, disabled }: BalanceTextFieldProps) => (
  <NumericTextField
    placeholder="0.00"
    value={balance}
    name={name}
    size="small"
    fullWidth
    slotProps={{
      input: {
        disableUnderline: true,
        sx: theme => ({
          height: SizesAndSpaces.LargeTokenInput.AmountHeight,
          maxHeight: SizesAndSpaces.LargeTokenInput.AmountHeight,
          backgroundColor: Transparent,
          color: isError ? theme.design.Inputs.Text.Error : theme.design.Inputs.Text.Value,
          ...theme.typography.headingSBold,
          '& input': {
            height: SizesAndSpaces.LargeTokenInput.AmountHeight,
            ...theme.typography.headingSBold,
          },
        }),
      },
    }}
    onChange={onChange}
    disabled={disabled}
  />
)
