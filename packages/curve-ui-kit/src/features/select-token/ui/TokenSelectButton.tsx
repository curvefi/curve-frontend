import CircularProgress from '@mui/material/CircularProgress'
import Select from '@mui/material/Select'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import type { SxProps } from '@mui/system'

import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'

const { Spacing, ButtonSize, MinWidth } = SizesAndSpaces

import type { TokenOption } from '../types'

const ButtonContent = ({ token, disabled }: { token: TokenOption; disabled: boolean }) => (
  <Stack direction="row" gap={Spacing.xxs} alignItems="center">
    <TokenIcon
      blockchainId={token.chain}
      symbol="" // No need for tooltip of symbol as it's displayed right next to it
      address={token.address}
      size="mui-md"
      sx={{
        opacity: disabled ? 0.5 : 1,
        filter: disabled ? 'saturate(0)' : 'none',
      }}
    />
    <Typography variant="bodyMBold">{token.symbol}</Typography>
  </Stack>
)

const Spinner = () => (
  <CircularProgress
    size={20}
    sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '0 auto',
      color: (theme) => theme.palette.text.secondary,
    }}
  />
)

export type TokenSelectButtonCallbacks = {
  onClick: () => void
}

export type TokenSelectButtonProps = {
  token?: TokenOption
  disabled: boolean
}

export type Props = TokenSelectButtonProps &
  TokenSelectButtonCallbacks & {
    sx?: SxProps
  }

/** The token selector is Select but acts like a button, so it's a bit unique */
export const TokenSelectButton = ({ token, disabled, onClick, sx }: Props) => (
  <Select
    value={token?.address ?? ''}
    onClick={disabled ? undefined : onClick}
    open={false}
    disabled={disabled}
    displayEmpty
    renderValue={() => (!!token ? <ButtonContent token={token} disabled={disabled} /> : <Spinner />)}
    IconComponent={KeyboardArrowDownIcon}
    sx={{
      minHeight: ButtonSize.sm,
      minWidth: MinWidth.select,
      backgroundColor: (t) => t.design.Layer[1].Fill,
      border: 'none',
      borderBottom: (t) => `2px solid ${t.design.Layer[1].Outline}`,
      ...(!disabled && {
        '&:hover': {
          border: 'none',
          borderBottom: (t) => `2px solid ${t.design.Layer[2].Outline}`,
        },
        '&:active': {
          border: 'none',
          borderBottom: (t) => `2px solid ${t.design.Layer[3].Outline}`,
        },
      }),
      '& .MuiOutlinedInput-notchedOutline': {
        border: 'none',
      },
      '& .MuiSelect-select': {
        padding: 0,
        paddingInlineStart: Spacing.sm,
        paddingInlineEnd: Spacing.xs,
      },
      ...sx,
    }}
  />
)
