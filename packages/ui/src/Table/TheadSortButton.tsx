import { ButtonHTMLAttributes } from 'react'
import { styled } from 'styled-components'
import type { ButtonProps } from 'ui/src/Button/types'
import { SortIcon } from 'ui/src/SortIcon/SortIcon'
import { Spinner } from 'ui/src/Spinner/Spinner'
import { TheadButton } from 'ui/src/Table'
import type { IndicatorPlacement } from './types'

export type Order = 'desc' | 'asc'

export type TheadSortButtonProps<T> = ButtonHTMLAttributes<HTMLButtonElement> &
  ButtonProps & {
    disabled?: boolean
    indicatorPlacement?: IndicatorPlacement
    loading?: boolean
    nowrap?: boolean
    sortIdKey: T
    sortBy: T | ''
    sortByOrder: Order
    handleBtnClickSort: (sortBy: string, sortByOrder: Order) => void
  }

export const TheadSortButton = ({
  children,
  disabled,
  indicatorPlacement = 'left',
  loading = false,
  sortBy,
  sortByOrder,
  sortIdKey,
  handleBtnClickSort,
  ...props
}: TheadSortButtonProps<string>) => {
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
