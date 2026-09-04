type ButtonStyle = { Label?: string; Fill?: string; Outline?: string }
type ButtonColor = { Default: ButtonStyle; Disabled?: ButtonStyle; Hover: ButtonStyle; Current?: ButtonStyle }

const buttonStyle = ({ Fill, Label, Outline }: ButtonStyle) => ({
  color: Label,
  backgroundColor: Fill,
  borderColor: Outline,
})

export const buttonColor = ({ Default, Disabled, Hover, Current }: ButtonColor) => ({
  ...buttonStyle(Default),
  '&:hover': buttonStyle(Hover),
  '&:disabled': Disabled && buttonStyle(Disabled),
  '&.current': Current && buttonStyle(Current),
})
