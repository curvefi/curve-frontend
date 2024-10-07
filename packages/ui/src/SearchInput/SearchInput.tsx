import * as React from 'react'
import styled from 'styled-components'

import Icon from 'ui/src/Icon/Icon'
import IconButton from 'ui/src/IconButton'
import { RCEditClear } from 'ui/src/images'
import InputDebounced from 'ui/src/InputComp/InputDebounced'
import InputProvider from 'ui/src/InputComp/InputProvider'

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
  id: string
  value: string
  handleInputChange: (val: string) => void
  handleSearchClose: () => void
}

const SearchInput = ({ className, id, value, handleInputChange, handleSearchClose, ...props }: Props) => {
  return (
    <InputProvider
      className={className}
      grid
      gridTemplateColumns="auto 1fr auto"
      gridColumnGap={2}
      flexAlignItems="center"
      id={id}
    >
      <Icon name="Search" size={24} aria-label="search-icon" />
      <InputDebounced
        {...props}
        id={id}
        type="search"
        labelProps={false}
        value={value}
        delay={1000}
        onChange={handleInputChange}
      />
      <ClearButton className={!!value ? 'show' : ''} onClick={handleSearchClose} padding={2}>
        <RCEditClear className="svg-tooltip" />
      </ClearButton>
    </InputProvider>
  )
}

const ClearButton = styled(IconButton)`
  display: none;
  min-width: 1.5625rem; //25px
  opacity: 1;
  padding: 0;

  &.show {
    display: inline-block;
  }

  .svg-tooltip {
    position: relative;
    top: 2px;
  }
`

export default SearchInput
