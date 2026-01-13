import { InputHTMLAttributes } from 'react'
import { styled } from 'styled-components'
import { useFocusRing } from '@react-aria/focus'
import { SearchInput } from 'ui/src/SearchInput/index'

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  className?: string
  searchText: string
  handleInputChange(val: string): void
  handleClose(): void
  testId?: string
}

export function SearchListInput({ className = '', searchText, handleInputChange, handleClose, ...inputProps }: Props) {
  const { isFocusVisible, focusProps } = useFocusRing()

  return (
    <StyledSearchInput
      id="inp-search"
      {...inputProps}
      {...focusProps}
      className={`${className} ${isFocusVisible ? 'focus-visible' : ''}`}
      value={searchText}
      handleInputChange={handleInputChange}
      handleSearchClose={handleClose}
    />
  )
}

const StyledSearchInput = styled(SearchInput)`
  min-height: 3.375rem; // 54px
`
