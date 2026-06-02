import { useRef } from 'react'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { InvertOnHover } from '@ui-kit/shared/ui/InvertOnHover'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
import { TransitionFunction } from '@ui-kit/themes/design/0_primitives'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { shortenAddress, formatNumber, amount } from '@ui-kit/utils'
import type { TokenOption as Option } from '../../types'

const { IconSize } = SizesAndSpaces

type TokenOptionCallbacks = {
  onToken: () => void
}

type TokenOptionsProps = {
  balance?: string
  tokenPrice?: number
  disabled?: boolean
  disabledReason?: string
}

export const TokenOption = ({
  chain,
  symbol,
  address,
  balance,
  tokenPrice,
  disabled,
  disabledReason,
  onToken,
}: Option & TokenOptionCallbacks & TokenOptionsProps) => {
  const hasBalance = +(balance ?? '0') > 0
  const hasBalanceUsd = hasBalance && (tokenPrice ?? 0) > 0
  const menuItemRef = useRef<HTMLLIElement>(null)
  const [primary, secondary, tertiary] = disabled
    ? Array(3).fill('textDisabled')
    : ['textPrimary', 'textSecondary', 'textTertiary']
  return (
    <InvertOnHover hoverRef={menuItemRef}>
      <Tooltip title={disabled && 'This token is not available because of'} body={disabledReason} placement="top">
        <MenuItem
          ref={menuItemRef}
          data-testid={`token-option-${symbol ?? address}`}
          // disabled={disabled} breaks `cursor: 'not-allowed'`
          onClick={disabled ? undefined : onToken}
          tabIndex={0}
          sx={{
            minHeight: IconSize.xxl,
            '&': { transition: `background-color ${TransitionFunction}` },
            ...(disabled && { cursor: 'not-allowed' }),
          }}
        >
          <TokenIcon
            blockchainId={chain}
            address={address}
            size="xl"
            sx={{ ...(disabled && { filter: 'saturate(0)' }) }}
          />

          <Stack sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <Typography variant="bodyMBold" color={primary} sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {symbol}
            </Typography>

            {hasBalance && (
              <Typography variant="bodyXsRegular" color={tertiary}>
                {shortenAddress(address)}
              </Typography>
            )}
          </Stack>

          <Stack direction="column" sx={{ alignItems: 'end' }}>
            {hasBalance && (
              <Typography variant="bodyMBold" color={primary}>
                {formatNumber(amount(balance), { decimals: 5, abbreviate: false, fallback: '-' })}
              </Typography>
            )}

            {hasBalanceUsd && (
              <Typography variant="bodyXsRegular" color={secondary}>
                {formatNumber(tokenPrice! * +balance!, { unit: 'dollar', abbreviate: false })}
              </Typography>
            )}

            {!hasBalance && (
              <Typography variant="bodyXsRegular" color={tertiary}>
                {shortenAddress(address)}
              </Typography>
            )}
          </Stack>
        </MenuItem>
      </Tooltip>
    </InvertOnHover>
  )
}
