import { RefObject, useCallback, useRef } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import TextField, { type TextFieldProps } from '@mui/material/TextField'
import { t } from '@ui-kit/lib/i18n'
import { SearchIcon } from '@ui-kit/shared/icons/SearchIcon'

type SearchFieldProps = TextFieldProps & {
  value: string
  onSearch: (search: string) => void
  inputRef?: RefObject<HTMLInputElement | null>
  disableAutoFocus?: boolean
}

/**
 * Controlled search field. It is cleared and focused when clicking the close button.
 */
export const SearchField = ({
  value,
  onSearch,
  placeholder = t`Search name or paste address`,
  name = 'search',
  inputRef,
  disableAutoFocus,
  ...props
}: SearchFieldProps) => {
  const localInputRef = useRef<HTMLInputElement | null>(null)
  const ref = inputRef || localInputRef
  const resetSearch = useCallback(() => {
    onSearch('')
    ref.current?.focus()
  }, [onSearch, ref])

  return (
    <TextField
      fullWidth
      onChange={e => onSearch(e.target.value)}
      slotProps={{
        htmlInput: { ref },
        input: {
          startAdornment: <SearchIcon />,
          endAdornment: value && (
            <IconButton size="extraSmall" onClick={resetSearch}>
              <CloseIcon />
            </IconButton>
          ),
        },
      }}
      variant="outlined"
      autoFocus={!disableAutoFocus}
      {...props}
      value={value}
      name={name}
      placeholder={placeholder}
    />
  )
}
