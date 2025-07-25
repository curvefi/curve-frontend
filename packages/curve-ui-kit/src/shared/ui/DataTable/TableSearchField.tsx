import { useRef } from 'react'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { SearchField } from '@ui-kit/shared/ui/SearchField'

export const TableSearchField = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [isFocused, onFocus, onBlur] = useSwitch()
  return (
    <SearchField
      inputRef={searchInputRef}
      value={value}
      onSearch={onChange}
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
