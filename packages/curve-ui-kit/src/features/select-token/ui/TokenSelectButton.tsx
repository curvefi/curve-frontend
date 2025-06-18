import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import CircularProgress from '@mui/material/CircularProgress'
import Select from '@mui/material/Select'
import type { SxProps } from '@mui/system'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { TokenOption } from '../types'

const { Spacing, ButtonSize, MinWidth } = SizesAndSpaces

const ButtonContent = ({ token, disabled }: { token: TokenOption; disabled: boolean }) => (
  <TokenLabel
    blockchainId={token.chain}
    address={token.address}
    size="mui-md"
    label={token.symbol}
    sx={{
      opacity: disabled ? 0.5 : 1,
      filter: disabled ? 'saturate(0)' : 'none',
    }}
  />
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
    value=""
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
