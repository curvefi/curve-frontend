import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'

import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { formatNumber, FORMAT_OPTIONS } from '@ui/utils'

import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { IconSize } = SizesAndSpaces

import type { TokenOption as Option } from '../../types'

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

  return (
    <MenuItem
      onClick={disabled ? undefined : onToken}
      sx={{
        minHeight: IconSize.xxl,
        ...(disabled && {
          opacity: 0.5,
          cursor: 'not-allowed',
        }),
      }}
    >
      {/* I'm abusing the symbol here to deliberately show a tooltip for the address instead */}
      <TokenIcon blockchainId={chain} tooltip={address} address={address} size="xl" />

      <Stack flexGrow={1}>
        <Typography variant="bodyMBold">{symbol}</Typography>
        <Typography variant="bodyXsRegular" color="textSecondary">
          {label}
        </Typography>
      </Stack>

      <Stack direction="column" alignItems="end">
        {hasBalance && <Typography variant="bodyMBold">{formatNumber(balance)}</Typography>}
        {hasBalanceUsd && (
          <Typography variant="bodyXsRegular" color="textSecondary">
            {formatNumber(tokenPrice! * +balance!, FORMAT_OPTIONS.USD)}
          </Typography>
        )}
      </Stack>
    </MenuItem>
  )
}
