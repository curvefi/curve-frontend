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

type TokenProps = TokenIconProps & {
  label: string
}

export const TokenLabel = ({ label, ...tokenIconProps }: TokenProps) => (
  <Stack direction="row" gap={Spacing[LABEL_SPACING[tokenIconProps.size ?? DEFAULT_SIZE]]} alignItems="center">
    <TokenIcon {...tokenIconProps} />
    <Typography
      variant="bodyMBold"
      sx={{
        // Lineheight is unset, as setting the line height to a certain size (as is default ehavior for Typography)
        // causes the text not to be perfectly centered vertically for unknown reason. Setting the 'vertical-align'
        // property to 'middle' does not appear to fix it, only unsetting the lineheight does.
        '&': { lineHeight: 'unset' },
      }}
    >
      {label}
    </Typography>
  </Stack>
)
