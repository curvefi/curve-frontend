import { RefObject, useCallback, useRef } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import IconButton from '@mui/material/IconButton'
import TextField, { type TextFieldProps } from '@mui/material/TextField'
import { useUniqueDebounce } from '@ui-kit/hooks/useDebounce'
import { t } from '@ui-kit/lib/i18n'
import { SearchIcon } from '@ui-kit/shared/icons/SearchIcon'

export type SearchFieldProps = TextFieldProps & {
  value?: string
  onSearch: (search: string) => void
  inputRef?: RefObject<HTMLInputElement | null>
  disableAutoFocus?: boolean
}

/** Compares two strings, ignoring leading and trailing whitespace. */
const searchFieldEquals = (a: string, b: string) => a.trim() === b.trim()

/**
 * Search field with debounced search. It is cleared and focused when clicking the close button.
 */
export const SearchField = ({
  value = '',
  onSearch,
  placeholder = t`Search name or paste address`,
  name = 'search',
  inputRef,
  disableAutoFocus,
  ...props
}: SearchFieldProps) => {
  const [search, setSearch] = useUniqueDebounce<string>({
    defaultValue: value,
    callback: onSearch,
    equals: searchFieldEquals,
  })
  const localInputRef = useRef<HTMLInputElement | null>(null)
  const ref = inputRef || localInputRef
  const resetSearch = useCallback(() => {
    setSearch('')
    ref.current?.focus()
  }, [setSearch, ref])
  return (
    <TextField
      fullWidth
      onChange={(e) => setSearch(e.target.value)}
      slotProps={{
        htmlInput: { ref },
        input: {
          startAdornment: <SearchIcon />,
          endAdornment: search && (
            <IconButton size="extraSmall" onClick={resetSearch}>
              <CloseIcon />
            </IconButton>
          ),
        },
      }}
      variant="outlined"
      autoFocus={!disableAutoFocus}
      {...props}
      value={search}
      name={name}
      placeholder={placeholder}
    />
  )
}
