import React from 'react'
import { useFocusRing } from '@react-aria/focus'
import styled from 'styled-components'

import SearchInput from 'ui/src/SearchInput/index'

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
  searchText: string
  handleInputChange(val: string): void
  handleClose(): void
}

function SearchListInput({ className = '', searchText, handleInputChange, handleClose, ...inputProps }: Props) {
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

export default SearchListInput
