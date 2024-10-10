import React from 'react'
import { useFocusRing } from '@react-aria/focus'
import styled from 'styled-components'

import SearchInput from 'ui/src/SearchInput/index'

type Props = {
  className?: string
  searchText: string
  handleInputChange(val: string): void
  handleClose(): void
}

function SearchListInput({ className = '', searchText, handleInputChange, handleClose }: Props) {
  const { isFocusVisible, focusProps } = useFocusRing()

  return (
    <StyledSearchInput
      id="inp-search"
      {...focusProps}
      className={`${className} ${isFocusVisible ? 'focus-visible' : ''}`}
      placeholder={`Search by tokens or address`}
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
