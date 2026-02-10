import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'
import Select from '@mui/material/Select'
import { Spinner } from '@ui-kit/shared/ui/Spinner'
import { TokenLabel } from '@ui-kit/shared/ui/TokenLabel'
import type { TokenOption } from '../types'

export type TokenSelectButtonCallbacks = {
  onClick: () => void
}

export type TokenSelectButtonProps = {
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
          testId={token.testId}
        />
      ) : (
        <Spinner useTheme={true} />
      )
    }
    IconComponent={KeyboardArrowDownIcon}
    // There's a Notion ticket to create a proper 'ghost' variant for MUI Select.
    sx={{
      '& .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
      '&.Mui-disabled .MuiOutlinedInput-notchedOutline': { borderColor: 'transparent' },
    }}
  />
)
