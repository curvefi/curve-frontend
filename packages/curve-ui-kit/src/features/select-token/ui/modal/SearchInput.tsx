import { useRef } from 'react'
import SearchIcon from '@mui/icons-material/Search'
import TextField from '@mui/material/TextField'
import useDebounce from '@ui-kit/hooks/useDebounce'
import { t } from '@ui-kit/lib/i18n'

type Props = {
  onSearch: (search: string) => void
  debounceMs?: number
}

export const SearchInput = ({ onSearch, debounceMs = 200 }: Props) => {
  const lastSearch = useRef('')

  const [search, setSearch] = useDebounce('', debounceMs, (value) => {
    const trimmed = value.trim()
    if (trimmed !== lastSearch.current) {
      lastSearch.current = trimmed
      onSearch(trimmed)
    }
  })

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
