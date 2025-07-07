import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TokenIcon, DEFAULT_SIZE, type Size, type TokenIconProps } from './TokenIcon'

const { Spacing } = SizesAndSpaces

const LABEL_SPACING = {
  sm: 'sm',
  'mui-sm': 'sm',
  'mui-md': 'sm',
  lg: 'sm',
  xl: 'md',
} satisfies Record<Size, keyof typeof Spacing>

type TokenLabelProps = TokenIconProps & {
  label: string
}

export const TokenLabel = ({ label, ...tokenIconProps }: TokenLabelProps) => (
  <Stack direction="row" gap={Spacing[LABEL_SPACING[tokenIconProps.size ?? DEFAULT_SIZE]]} alignItems="center">
    <TokenIcon {...tokenIconProps} />
    <Typography
      variant="bodyMBold"
      color={tokenIconProps.disabled ? 'textDisabled' : undefined}
      // Remove line-height to ensure proper vertical centering with TokenIcon
      // MUI Typography's default line-height prevents perfect vertical alignment
      sx={{ '&': { lineHeight: 'unset' } }}
    >
      {label}
    </Typography>
  </Stack>
)
