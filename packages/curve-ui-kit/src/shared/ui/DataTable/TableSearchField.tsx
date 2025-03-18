import { useRef } from 'react'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { SearchField } from '@ui-kit/shared/ui/SearchField'

export const TableSearchField = ({ onSearch }: { onSearch: (value: string) => void }) => {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [isFocused, onFocus, onBlur] = useSwitch()
  return (
    <SearchField
      inputRef={searchInputRef}
      onSearch={onSearch}
      size="small"
      data-testid="table-text-search"
      onFocus={onFocus}
      onBlur={onBlur}
      sx={(t) => ({
        transition: t.design.Button.Transition,
        ...(!isFocused && {
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: `transparent transparent ${t.design.Inputs.Base.Default.Border.Default} transparent`,
          },
        }),
      })}
    />
  )
}
