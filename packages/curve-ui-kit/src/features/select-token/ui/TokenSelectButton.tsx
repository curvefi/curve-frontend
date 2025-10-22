import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import Select from '@mui/material/Select'
import type { SxProps } from '@mui/system'
import { useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import { Spinner } from '@ui-kit/shared/ui/Spinner'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ReleaseChannel } from '@ui-kit/utils'
import type { TokenOption } from '../types'

const { Spacing } = SizesAndSpaces

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
export const TokenSelectButton = ({ token, disabled, onClick, sx }: Props) => {
  const [releaseChannel] = useReleaseChannel()

  return (
    <Select
      value=""
      onClick={disabled ? undefined : onClick}
      open={false}
      disabled={disabled}
      displayEmpty
      size="medium"
      renderValue={() =>
        token ? (
          <TokenLabel
            blockchainId={token.chain}
            address={token.address}
            size="mui-md"
            label={token.symbol}
            disabled={disabled}
          />
        ) : (
          <Spinner useTheme={true} />
        )
      }
      IconComponent={KeyboardArrowDownIcon}
      sx={{
        backgroundColor: (t) => t.design.Layer[1].Fill,
        ...(releaseChannel !== ReleaseChannel.Beta && {
          border: 'none',
          borderBottom: (t: any) => `2px solid ${t.design.Layer[1].Outline}`,
          ...(!disabled && {
            '&:hover': {
              border: 'none',
              borderBottom: (t: any) => `2px solid ${t.design.Layer[2].Outline}`,
            },
            '&:active': {
              border: 'none',
              borderBottom: (t: any) => `2px solid ${t.design.Layer[3].Outline}`,
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
        }),
      }}
    />
  )
}
