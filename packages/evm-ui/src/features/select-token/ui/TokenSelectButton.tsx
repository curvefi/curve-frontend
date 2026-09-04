import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { Select, type SelectProps } from '@ui/components/Select'
import { Spinner } from '@ui/components/Spinner'
import { TokenLabel } from '@ui/components/TokenLabel'
import type { TokenOption } from '../types'

type TokenSelectButtonCallbacks = {
  onClick: () => void
}

type TokenSelectButtonProps = {
  token?: TokenOption
  disabled: boolean
  size?: SelectProps['size']
  testId?: string
}

/** The token selector is Select but acts like a button, so it's a bit unique */
export const TokenSelectButton = ({
  token,
  disabled,
  size = 'medium',
  testId,
  onClick,
}: TokenSelectButtonProps & TokenSelectButtonCallbacks) => (
  <Select
    data-testid={testId}
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
