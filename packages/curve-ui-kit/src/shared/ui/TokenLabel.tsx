import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { TypographyProps } from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TokenIcon, DEFAULT_SIZE, type Size, type TokenIconProps } from './TokenIcon'

const { Spacing } = SizesAndSpaces

const LABEL_SPACING = {
  xs: 'xs',
  sm: 'sm',
  'mui-sm': 'sm',
  'mui-md': 'sm',
  lg: 'sm',
  xl: 'md',
} satisfies Record<Size, keyof typeof Spacing>

type TokenLabelProps = TokenIconProps & {
  label: string
  noWrap?: boolean
  typographyVariant?: TypographyProps['variant']
}

export const TokenLabel = ({ label, noWrap, typographyVariant = 'bodyMBold', ...tokenIconProps }: TokenLabelProps) => (
  <Stack
    direction="row"
    sx={{
      gap: Spacing[LABEL_SPACING[tokenIconProps.size ?? DEFAULT_SIZE]],
      alignItems: 'center',
      ...(noWrap && { minWidth: 0 }),
    }}
  >
    <TokenIcon {...tokenIconProps} />
    <Stack sx={{ ...(noWrap && { minWidth: 0 }) }}>
      <Typography
        variant={typographyVariant}
        color={tokenIconProps.disabled ? 'textDisabled' : undefined}
        noWrap={noWrap}
        // Remove line-height to ensure proper vertical centering with TokenIcon
        // MUI Typography's default line-height prevents perfect vertical alignment
        sx={{ '&': { lineHeight: 'unset' } }}
      >
        {label}
      </Typography>
      {/* TODO: add token description */}
    </Stack>
  </Stack>
)
