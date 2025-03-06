import { useState, useEffect, useRef } from 'react'
import TextField from '@mui/material/TextField'
import SearchIcon from '@mui/icons-material/Search'
import { t } from '@ui-kit/lib/i18n'

type Props = {
  onSearch: (search: string) => void
  debounceMs?: number
}

export const SearchInput = ({ onSearch, debounceMs = 200 }: Props) => {
  const [search, setSearch] = useState('')
  const lastSearch = useRef(search)

  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = search.trim()
      if (trimmed !== lastSearch.current) {
        lastSearch.current = trimmed
        onSearch(trimmed)
      }
    }, debounceMs)
    return () => clearTimeout(timer)
  }, [onSearch, search, debounceMs])

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
