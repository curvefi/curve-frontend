import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import { Select } from '@ui-kit/shared/ui/Select'
import { Spinner } from '@ui-kit/shared/ui/Spinner'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import type { TokenOption } from '../types'

type TokenSelectButtonCallbacks = {
  onClick: () => void
}

type TokenSelectButtonProps = {
  token?: TokenOption
  disabled: boolean
}

/** The token selector is Select but acts like a button, so it's a bit unique */
export const TokenSelectButton = ({
  token,
  disabled,
  onClick,
}: TokenSelectButtonProps & TokenSelectButtonCallbacks) => (
  <Select
    value=""
    variant="ghost"
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
  />
)
