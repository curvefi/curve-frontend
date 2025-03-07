import { useRef } from 'react'
import MenuItem from '@mui/material/MenuItem'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { useClassObserver } from '@ui-kit/hooks/useClassObserver'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { InvertTheme } from '@ui-kit/shared/ui/ThemeProvider'
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
  const hasBalanceUsd = hasBalance && (tokenPrice ?? 0 > 0)
  const showAddress = !hasBalance

  const menuItem = useRef<HTMLLIElement>(null)
  const isFocusVisible = useClassObserver(menuItem, 'Mui-focusVisible')
  const [isHover, onMouseEnter, onMouseLeave] = useSwitch(false)

  return (
    <InvertTheme inverted={isHover || isFocusVisible}>
      <MenuItem
        ref={menuItem}
        // disabled={disabled} breaks `cursor: 'not-allowed'`
        onClick={disabled ? undefined : onToken}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        tabIndex={0}
        sx={{
          minHeight: IconSize.xxl,
          '&': { transition: `background-color ${TransitionFunction}` },
          /**
           * Rely on the theme inverter for focus visible design.
           * I'm tired and for now this is the best I could achieve.
           * Needs to be generalized somehow, and also the background color
           * isn't exactly the same as if it's hovered. This is for another PR
           */
          '&.Mui-focusVisible': {
            backgroundColor: (t) => t.design['Layer'][1].Fill,
            '.MuiTypography-root': { '--mui-palette-text-primary': 'inherit' },
          },
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
              {shortenAddress(address, 4, false)}
            </Typography>
          )}
        </Stack>
      </MenuItem>
    </InvertTheme>
  )
}
