import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { Select, type SelectProps } from '@ui-kit/shared/ui/Select'
import { Spinner } from '@ui-kit/shared/ui/Spinner'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { handleBreakpoints } from '@ui-kit/themes/basic-theme'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { TokenOption } from '../types'

const { IconSize, SelectSpacing, Spacing } = SizesAndSpaces

const smallTokenSelectorIconSpace = {
  mobile: `calc(${IconSize.lg.desktop} + ${SelectSpacing.IconPaddingRight.small.mobile})`,
  tablet: `calc(${IconSize.lg.desktop} + ${SelectSpacing.IconPaddingRight.small.tablet})`,
  desktop: `calc(${IconSize.lg.desktop} + ${SelectSpacing.IconPaddingRight.small.desktop})`,
}

const smallTokenSelectorSx = {
  // Token selector triggers use the visual Select pattern, but token symbols do not need the generic value/icon gap
  // because the trigger label is an intrinsic token chip rather than free-form select text.
  '&& .MuiSelect-select.MuiSelect-select': {
    ...handleBreakpoints({
      paddingInlineEnd: smallTokenSelectorIconSpace,
      paddingRight: smallTokenSelectorIconSpace,
      '--icon-space': smallTokenSelectorIconSpace,
    }),
  },
}

type TokenSelectButtonCallbacks = {
  onClick: () => void
}

type TokenSelectButtonProps = {
  token?: TokenOption
  disabled: boolean
  size?: SelectProps['size']
}

const TokenSelectButtonLabel = ({
  token,
  disabled,
  size,
}: {
  token: TokenOption
  disabled: boolean
  size: SelectProps['size']
}) =>
  size === 'small' ? (
    <Stack direction="row" sx={{ alignItems: 'center', gap: Spacing.xxs, minWidth: 0 }}>
      <TokenIcon blockchainId={token.chain} address={token.address} size="mui-md" disabled={disabled} />
      <Typography
        variant="bodySBold"
        noWrap
        sx={{ minWidth: 0, color: t => (disabled ? t.design.Select.Text.Disabled : t.design.Select.Text.Value) }}
      >
        {token.symbol}
      </Typography>
    </Stack>
  ) : (
    <TokenLabel
      blockchainId={token.chain}
      address={token.address}
      size="mui-md"
      label={token.symbol}
      disabled={disabled}
    />
  )

/** The token selector is Select but acts like a button, so it's a bit unique */
export const TokenSelectButton = ({
  token,
  disabled,
  size = 'medium',
  onClick,
}: TokenSelectButtonProps & TokenSelectButtonCallbacks) => (
  <Select
    value=""
    variant="ghost"
    onClick={disabled ? undefined : onClick}
    open={false}
    disabled={disabled}
    displayEmpty
    size={size}
    sx={size === 'small' ? smallTokenSelectorSx : undefined}
    renderValue={() =>
      token ? <TokenSelectButtonLabel token={token} disabled={disabled} size={size} /> : <Spinner useTheme={true} />
    }
    IconComponent={KeyboardArrowDownIcon}
  />
)
