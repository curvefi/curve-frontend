import { RefObject, useCallback, useRef } from 'react'
import CloseIcon from '@mui/icons-material/Close'
import SearchIcon from '@mui/icons-material/Search'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import type { TextFieldProps } from '@mui/material/TextField/TextField'
import { useUniqueDebounce } from '@ui-kit/hooks/useDebounce'
import { t } from '@ui-kit/lib/i18n'

type SearchFieldProps = TextFieldProps & {
  onSearch: (search: string) => void
  onClose?: () => void
  inputRef?: RefObject<HTMLInputElement | null>
}

const defaultSearch = ''

/**
 * Search field with debounced search. The search field is cleared when the user clicks the close button.
 */
export const SearchField = ({
  onSearch,
  onClose,
  placeholder = t`Search name or paste address`,
  name = 'search',
  inputRef,
  ...props
}: SearchFieldProps) => {
  const [search, setSearch] = useUniqueDebounce<string>(defaultSearch, onSearch)
  const localInputRef = useRef<HTMLInputElement | null>(null)
  const ref = inputRef || localInputRef
  const resetSearch = useCallback(() => {
    setSearch('')
    onClose ? onClose() : ref.current?.focus()
  }, [setSearch, ref, onClose])
  return (
    <TextField
      {...props}
      fullWidth
      placeholder={placeholder}
      onChange={(e) => setSearch(e.target.value)}
      slotProps={{
        htmlInput: { ref },
        input: {
          startAdornment: <SearchIcon />,
          endAdornment: (onClose || search) && (
            <IconButton size="extraSmall" onClick={resetSearch}>
              <CloseIcon />
            </IconButton>
          ),
        },
      }}
      variant="outlined"
      value={search}
      name={name}
      autoFocus
    />
  )
}
