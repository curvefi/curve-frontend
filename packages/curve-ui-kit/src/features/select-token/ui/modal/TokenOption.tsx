import { useRef } from 'react'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { InvertOnHover } from '@ui-kit/shared/ui/InvertOnHover'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { shortenAddress } from '@ui-kit/utils'
import type { TokenOption as Option } from '../../types'

const { IconSize } = SizesAndSpaces

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
  const hasBalanceUsd = hasBalance && (tokenPrice ?? 0) > 0
  const showAddress = !hasBalanceUsd

  const menuItem = useRef<HTMLLIElement>(null)

  return (
    <InvertOnHover hoverRef={menuItem}>
      <MenuItem
        ref={menuItem}
        // disabled={disabled} breaks `cursor: 'not-allowed'`
        onClick={disabled ? undefined : onToken}
        tabIndex={0}
        sx={{
          minHeight: IconSize.xxl,
          '&': { transition: `background-color ${TransitionFunction}` },
          ...(disabled && {
            cursor: 'not-allowed',
          }),
        }}
      >
        <TokenIcon
          blockchainId={chain}
          address={address}
          size="xl"
          sx={{
            ...(disabled && {
              filter: 'saturate(0)',
            }),
          }}
        />

        <Stack flexGrow={1}>
          <Typography variant="bodyMBold" color={disabled ? 'textDisabled' : 'textPrimary'}>
            {symbol}
          </Typography>

          <Typography variant="bodyXsRegular" color={disabled ? 'textDisabled' : 'textSecondary'}>
            {label}
          </Typography>
        </Stack>

        <Stack direction="column" alignItems="end">
          {hasBalance && (
            <Typography variant="bodyMBold" color={disabled ? 'textDisabled' : 'textPrimary'}>
              {formatNumber(balance)}
            </Typography>
          )}

          {hasBalanceUsd && (
            <Typography variant="bodyXsRegular" color={disabled ? 'textDisabled' : 'textSecondary'}>
              {formatNumber(tokenPrice! * +balance!, FORMAT_OPTIONS.USD)}
            </Typography>
          )}

          {showAddress && (
            <Typography variant="bodyXsRegular" color={disabled ? 'textDisabled' : 'textTertiary'}>
              {shortenAddress(address)}
            </Typography>
          )}
        </Stack>
      </MenuItem>
    </InvertOnHover>
  )
}
