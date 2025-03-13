import SearchIcon from '@mui/icons-material/Search'
import TextField from '@mui/material/TextField'
import { useSearchDebounce } from '@ui-kit/hooks/useDebounce'
import { t } from '@ui-kit/lib/i18n'

type Props = {
  onSearch: (search: string) => void
  debounceMs?: number
}

const defaultSearch = ''

export const SearchInput = ({ onSearch }: Props) => {
  const [search, setSearch] = useSearchDebounce<string>(defaultSearch, onSearch)
  return (
    <TextField
      fullWidth
      placeholder={t`Search name or paste address`}
      onChange={(e) => setSearch(e.target.value)}
      slotProps={{ input: { startAdornment: <SearchIcon /> } }}
      variant="outlined"
      value={search}
      name="tokenName"
      autoFocus
    />
  )
}
