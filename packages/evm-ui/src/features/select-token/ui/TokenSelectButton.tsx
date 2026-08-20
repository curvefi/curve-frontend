import { Select, type SelectProps } from '@evm-ui/shared/ui/Select'
import { Spinner } from '@evm-ui/shared/ui/Spinner'
import { TokenLabel } from '@evm-ui/shared/ui/TokenLabel'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import type { TokenOption } from '../types'

type TokenSelectButtonCallbacks = {
  onClick: () => void
}

type TokenSelectButtonProps = {
  token?: TokenOption
  disabled: boolean
  size?: SelectProps['size']
}

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
    renderValue={() =>
      token ? (
        <TokenLabel
          blockchainId={token.chain}
          address={token.address}
          size="mui-md"
          label={token.symbol}
          disabled={disabled}
          noWrap
          typographyVariant={size === 'small' ? 'bodySBold' : undefined}
        />
      ) : (
        <Spinner useTheme={true} />
      )
    }
    IconComponent={KeyboardArrowDownIcon}
  />
)
