import React from 'react'
import styled from 'styled-components'

import Box from 'ui/src/Box'
import Button from 'ui/src/Button'
import Icon from 'ui/src/Icon'
import Spinner from 'ui/src/Spinner'

const TableButtonFilters = ({
  disabled,
  filters,
  filterKey,
  isLoading,
  resultsLength,
  updateRouteFilterKey,
}: {
  disabled: boolean | undefined
  filters: {
    [_: string]: { id: string; displayName: string; color?: string }
  }
  filterKey: string
  isLoading: boolean
  resultsLength: number | undefined
  updateRouteFilterKey(filterKey: string): void
}) => {
  return (
    <Wrapper flex flexAlignItems="center">
      {Object.keys(filters).map((k) => {
        const { id, color, displayName } = filters[k]
        const isActive = filterKey === id
        return (
          <Button
            key={id}
            nowrap
            disabled={disabled}
            size="small"
            className={isActive ? 'active' : ''}
            variant="select"
            onClick={() => updateRouteFilterKey(id)}
          >
            {color && <FilterIcon size={16} name="StopFilledAlt" fill={color} strokeWidth="1px" stroke="white" />}
            {displayName}{' '}
            {isLoading && isActive ? <FilterSpinner isDisabled size={10} /> : isActive ? resultsLength || '0' : ''}
          </Button>
        )
      })}
    </Wrapper>
  )
}

const FilterSpinner = styled(Spinner)`
  margin-left: var(--spacing-1);
`

const Wrapper = styled(Box)`
  min-height: 2.4375rem;
  flex-wrap: wrap;

  button {
    margin-right: var(--spacing-2);
    margin-bottom: var(--spacing-2);
  }
`

const FilterIcon = styled(Icon)`
  position: relative;
  top: 3px;
`

export default TableButtonFilters
