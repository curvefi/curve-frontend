import type { Decimal } from '@primitives/decimal.utils'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { NumericTextField } from '../NumericTextField'

const { FontSize, FontWeight, Sizing } = SizesAndSpaces

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
    variant="standard"
    value={balance}
    name={name}
    fullWidth
    slotProps={{
      input: {
        disableUnderline: true,
        sx: {
          maxHeight: Sizing.lg,
          backgroundColor: (t) => t.design.Inputs.Large.Default.Fill,
          fontFamily: (t) => t.typography.highlightXl.fontFamily,
          fontSize: FontSize.xl,
          fontWeight: FontWeight.Bold,
          color: (t) => (isError ? t.design.Layer.Feedback.Error : t.design.Text.TextColors.Primary),
        },
      },
    }}
    onChange={onChange}
    disabled={disabled}
  />
)
