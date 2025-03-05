import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { formatNumber, FORMAT_OPTIONS } from '@ui/utils'

import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { InvertTheme } from '@ui-kit/shared/ui/ThemeProvider'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { IconSize } = SizesAndSpaces

import type { TokenOption as Option } from '../../types'
import { addressShort } from '@ui-kit/utils'

export type TokenOptionCallbacks = {
  onToken: () => void
}

export type TokenOptionsProps = {
  balance?: string
  tokenPrice?: number
  disabled?: boolean
}

export type Props = Option & TokenOptionCallbacks & TokenOptionsProps

export const TokenOption = ({ chain, symbol, label, address, balance, tokenPrice, disabled, onToken }: Props) => {
  const hasBalance = +(balance ?? '0') > 0
  const hasBalanceUsd = hasBalance && (tokenPrice ?? 0 > 0)
  const showAddress = !hasBalance

  const [isHover, onMouseEnter, onMouseLeave] = useSwitch(false)

  return (
    <InvertTheme inverted={isHover}>
      <MenuItem
        onClick={disabled ? undefined : onToken}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        sx={{
          minHeight: IconSize.xxl,
          '&': { transition: `background-color ${TransitionFunction}` },
          ...(disabled && {
            opacity: 0.5,
            cursor: 'not-allowed',
          }),
        }}
      >
        <TokenIcon blockchainId={chain} address={address} size="xl" />

        <Stack flexGrow={1}>
          <Typography variant="bodyMBold" color="textPrimary">
            {symbol}
          </Typography>

          <Typography variant="bodyXsRegular" color="textSecondary">
            {label}
          </Typography>
        </Stack>

        <Stack direction="column" alignItems="end">
          {hasBalance && (
            <Typography variant="bodyMBold" color="textPrimary">
              {formatNumber(balance)}
            </Typography>
          )}

          {hasBalanceUsd && (
            <Typography variant="bodyXsRegular" color="textSecondary">
              {formatNumber(tokenPrice! * +balance!, FORMAT_OPTIONS.USD)}
            </Typography>
          )}

          {showAddress && (
            <Typography variant="bodyXsRegular" color="textTertiary">
              {addressShort(address)}
            </Typography>
          )}
        </Stack>
      </MenuItem>
    </InvertTheme>
  )
}
