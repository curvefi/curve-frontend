import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import type { TypographyProps } from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { TokenIcon, DEFAULT_SIZE, type Size, type TokenIconProps } from './TokenIcon'
import { TokenIcons, type TokenIconsProps, type TokenOrPair } from './TokenIcons'

const { Spacing } = SizesAndSpaces

const LABEL_SPACING = { xs: 'xs', sm: 'sm', 'mui-sm': 'sm', 'mui-md': 'sm', lg: 'sm', xl: 'md' } satisfies Record<
  Size,
  keyof typeof Spacing
>

/** TokenIcons size with the same width as the TokenIcon size */
const TOKEN_ICONS_SIZE: Partial<Record<Size, TokenIconsProps['size']>> = { 'mui-md': 'md', lg: 'lg', xl: 'xl' }

type TokenLabelProps = TokenIconProps & {
  label: string | undefined
  /** The coins of an LP token, drawn instead of its own icon as in the pool list */
  tokens?: TokenOrPair[]
  noWrap?: boolean
  typographyVariant?: TypographyProps['variant']
}

export const TokenLabel = ({
  label,
  noWrap,
  typographyVariant = 'bodyMBold',
  tokens,
  ...tokenIconProps
}: TokenLabelProps) => {
  const { blockchainId, size = DEFAULT_SIZE } = tokenIconProps
  const iconsSize = TOKEN_ICONS_SIZE[size]
  return (
    <Stack
      direction="row"
      sx={{
        gap: Spacing[LABEL_SPACING[size]],
        alignItems: 'center',
        ...(noWrap && { minWidth: 0 }),
      }}
    >
      {tokens && blockchainId && iconsSize ? (
        <TokenIcons blockchainId={blockchainId} tokens={tokens} size={iconsSize} showTooltips={false} />
      ) : (
        <TokenIcon {...tokenIconProps} />
      )}
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
}
