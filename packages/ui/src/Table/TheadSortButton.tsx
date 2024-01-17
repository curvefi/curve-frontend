import type { IndicatorPlacement } from './types'
import type { ButtonProps } from 'ui/src/Button/types'

import * as React from 'react'
import styled from 'styled-components'

import Spinner from 'ui/src/Spinner/Spinner'
import SortIcon from 'ui/src/SortIcon/SortIcon'
import TheadButton from 'ui/src/Table/TheadButton'

export type Order = 'desc' | 'asc'

const TheadSortButton = ({
  children,
  disabled,
  indicatorPlacement,
  loading,
  sortBy,
  sortByOrder,
  sortIdKey,
  handleBtnClickSort,
  ...props
}: React.PropsWithChildren<
  React.ButtonHTMLAttributes<HTMLButtonElement> &
    ButtonProps & {
      disabled?: boolean
      indicatorPlacement?: IndicatorPlacement
      loading: boolean
      nowrap?: boolean
      sortIdKey: string
      sortBy: string
      sortByOrder: Order
      handleBtnClickSort: (sortBy: string, sortByOrder: Order) => void
    }
>) => {
  const handleClick = (activeSortBy: string) => {
    let updatedSortOrder: Order = 'desc'

    if (activeSortBy === sortBy) {
      updatedSortOrder = sortByOrder === 'desc' ? 'asc' : 'desc'
    }
    handleBtnClickSort(activeSortBy, updatedSortOrder)
  }

  return (
    <TheadButton disabled={disabled || loading} onClick={() => handleClick(sortIdKey)} {...props}>
      {indicatorPlacement === 'left' && (
        <>
          {<StyledSpinner isVisible={loading && sortIdKey === sortBy} size={12} />}
          <StyledSortIcon isVisible={sortIdKey === sortBy} activeType={sortByOrder} />
        </>
      )}

      {children}

      {indicatorPlacement === 'right' && (
        <>
          <StyledSortIcon isVisible={sortIdKey === sortBy} activeType={sortByOrder} />
          {<StyledSpinner isVisible={loading && sortIdKey === sortBy} size={12} />}
        </>
      )}
    </TheadButton>
  )
}

const StyledSpinner = styled(Spinner)<{ isVisible: boolean }>`
  display: ${({ isVisible }) => (isVisible ? 'inline-block' : 'none')};
`

const StyledSortIcon = styled(SortIcon)<{ isVisible: boolean }>`
  display: ${({ isVisible }) => (isVisible ? 'inline-block' : 'none')};
  font-size: 5px;
`

TheadSortButton.defaultProps = {
  align: ['center', 'center'],
  indicatorPlacement: 'left',
}

export default TheadSortButton
