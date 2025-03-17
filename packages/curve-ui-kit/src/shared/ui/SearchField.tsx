import SearchIcon from '@mui/icons-material/Search'
import TextField from '@mui/material/TextField'
import type { TextFieldProps } from '@mui/material/TextField/TextField'
import { useUniqueDebounce } from '@ui-kit/hooks/useDebounce'
import { t } from '@ui-kit/lib/i18n'

type SearchFieldProps = TextFieldProps & {
  onSearch: (search: string) => void
}

const defaultSearch = ''

export const SearchField = ({
  onSearch,
  placeholder = t`Search name or paste address`,
  name = 'search',
  ...props
}: SearchFieldProps) => {
  const [search, setSearch] = useUniqueDebounce<string>(defaultSearch, onSearch)
  return (
    <TextField
      {...props}
      fullWidth
      placeholder={placeholder}
      onChange={(e) => setSearch(e.target.value)}
      slotProps={{ input: { startAdornment: <SearchIcon /> } }}
      variant="outlined"
      value={search}
      name={name}
      autoFocus
    />
  )
}
