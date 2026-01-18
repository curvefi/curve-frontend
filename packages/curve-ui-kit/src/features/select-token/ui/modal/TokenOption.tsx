import { useRef } from 'react'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { InvertOnHover } from '@ui-kit/shared/ui/InvertOnHover'
import { TokenIcon } from '@ui-kit/shared/ui/TokenIcon'
import { Tooltip } from '@ui-kit/shared/ui/Tooltip'
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
  disabledReason?: string
}

export type Props = Option & TokenOptionCallbacks & TokenOptionsProps

export const TokenOption = ({
  chain,
  symbol,
  name,
  label,
  address,
  balance,
  tokenPrice,
  disabled,
  disabledReason,
  onToken,
}: Props) => {
  const hasBalance = +(balance ?? '0') > 0
  const hasBalanceUsd = hasBalance && (tokenPrice ?? 0) > 0
  const showAddress = !hasBalanceUsd

  const menuItem = useRef<HTMLLIElement>(null)

  return (
    <InvertOnHover hoverRef={menuItem}>
      <Tooltip title={disabled && 'This token is not available because of'} body={disabledReason} placement="top">
        <MenuItem
          ref={menuItem}
          data-testid={`token-option-${symbol ?? address}`}
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

            {name && (
              <Typography variant="bodyXsRegular" color={disabled ? 'textDisabled' : 'textSecondary'}>
                {name}
              </Typography>
            )}

            {label && (
              <Typography variant="bodyXsRegular" color={disabled ? 'textDisabled' : 'textTertiary'}>
                {label}
              </Typography>
            )}
          </Stack>

          <Stack direction="column" alignItems="end">
            {hasBalance && (
              <Typography variant="bodyMBold" color={disabled ? 'textDisabled' : 'textPrimary'}>
                {formatNumber(balance, { decimals: 5 })}
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
      </Tooltip>
    </InvertOnHover>
  )
}
