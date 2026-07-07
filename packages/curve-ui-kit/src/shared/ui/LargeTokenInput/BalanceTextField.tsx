import type { Decimal } from '@primitives/decimal.utils'
import { TRANSPARENT } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { NumericTextField } from '../NumericTextField'

const { AmountHeight: AMOUNT_HEIGHT } = SizesAndSpaces.LargeTokenInput

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
    error={isError}
    slotProps={{
      input: {
        disableUnderline: true,
        sx: theme => ({
          height: AMOUNT_HEIGHT,
          '&&&': { backgroundColor: TRANSPARENT },
          color: theme.design.Inputs.Text[isError ? 'Error' : 'Value'],
          ...theme.typography.headingSBold,
          '&& input.MuiInputBase-input': {
            height: AMOUNT_HEIGHT,
            paddingInlineStart: 0,
            ...theme.typography.headingSBold,
          },
        }),
      },
    }}
    onChange={onChange}
    disabled={disabled}
  />
)
