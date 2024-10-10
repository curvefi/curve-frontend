import type { Node } from '@react-types/shared'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { AriaListBoxOptions, useFilter, usePreventScroll } from 'react-aria'
import { SelectState } from 'react-stately'
import { t } from '@lingui/macro'
import Fuse from 'fuse.js'
import styled from 'styled-components'

import { RCEditClear } from 'ui/src/images'
import { StyledInput } from 'ui/src/InputComp/styles'
import Box from 'ui/src/Box/Box'
import Checkbox from 'ui/src/Checkbox'

import Icon from 'ui/src/Icon'
import IconButton from 'ui/src/IconButton/IconButton'
import InputProvider from 'ui/src/InputComp/InputProvider'
import Popover from 'ui/src/Popover/Popover'
import Spinner from 'ui/src/Spinner'
import SpinnerWrapper from 'ui/src/Spinner/SpinnerWrapper'
import SearchSelectListItem from 'ui/src/Select/SelectSearchListItem'
import useIntersectionObserver from 'ui/src/hooks/useIntersectionObserver'

type EndsWith = (string: string, substring: string) => boolean

function SelectSearchList<T>({
  listBoxHeight,
  searchFilterKeys = ['value.label'],
  state,
  onSelectionChange,
}: Omit<AriaListBoxOptions<T>, 'onSelectionChange'> & {
  state: SelectState<T>
  searchFilterKeys: string[]
  listBoxRef?: React.RefObject<HTMLUListElement>
  listBoxHeight?: string
  onSelectionChange: (key: React.Key) => void
}) {
  const ref = useRef<HTMLUListElement>(null)
  const entry = useIntersectionObserver(ref, { freezeOnceVisible: false })

  const isVisible = !!entry?.isIntersecting
  const { endsWith } = useFilter({ sensitivity: 'base' })
  const topContentRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const items = [...state.collection]

  const [result, setResult] = useState<Node<T>[]>(items ?? [])
  const [topContentHeight, setTopContentHeight] = useState<number | undefined>()

  const [filterValue, setFilterValue] = useState('')
  usePreventScroll() // prevent scrolling while modal is open
  // const [searchResult, setSearchResult] = useState<T[] | undefined>()

  const handleDialogClose = () => {
    console.log('todo close dialog')
    state.close()
  }

  console.log('items', items)

  const handleInpChange = useCallback(
    (filterValue: string, items: Node<T>[]) => {
      setFilterValue(filterValue)
      let searchResult = items

      if (filterValue && items.length > 0) {
        searchResult = _filter(filterValue, endsWith, items, searchFilterKeys)
      }

      setResult(searchResult)
    },
    [endsWith, searchFilterKeys],
  )

  // const handleDialogOpen = useCallback(() => {
  //   if (typeof onOpen === 'function') onOpen()
  //
  //   setSearchResult(items)
  //   setFilterValue('')
  //   overlayTriggerState.open()
  // }, [items, onOpen, overlayTriggerState])
  //
  // const handleDialogClose = useCallback(() => {
  //   if (isMobile) {
  //     delayAction(overlayTriggerState.close)
  //   } else {
  //     overlayTriggerState.close()
  //   }
  // }, [isMobile, overlayTriggerState])

  const handleOnSelectChange = useCallback(
    (selected: React.Key) => {
      onSelectionChange(selected)
      handleDialogClose()
    },
    [handleDialogClose, onSelectionChange],
  )

  // update result if tokens list changed.
  // useEffect(() => {
  //   if (Array.isArray(items) && items.length > 0) {
  //     if (filterValue) {
  //       handleInpChange(filterValue, items)
  //     } else {
  //       setSearchResult(items)
  //     }
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [items])
  //
  // useEffect(() => {
  //   if (topContentRef?.current) {
  //     setTopContentHeight(topContentRef.current.getBoundingClientRect().height)
  //   }
  // }, [topContentRef])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const testId = ''

  return (
    <>
      <Box grid gridGap={3}>
        <Box grid gridColumnGap={1} gridTemplateColumns="1fr auto" margin="1.5rem 0.5rem 0 1rem">
          <ComboBoxSearchInpWrapper id="inp-search">
            <Icon name="Search" size={24} aria-label="search icon" />
            <StyledInput
              ref={inputRef}
              id="select-inp"
              data-testid={`inp-search-${testId}`}
              aria-label={t`Search`}
              placeholder={t`Search`}
              type="search"
              value={filterValue}
              onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => handleInpChange(value, items)}
              onKeyDown={(evt) => {
                // scroll to first item on list
                if (evt.key === 'ArrowDown' && result && result.length > 0 && listRef.current) {
                  console.log('key up')
                  const visibleList = listRef.current.querySelector('.visible')
                  const firstButton = visibleList?.querySelector?.('button')

                  if (firstButton) {
                    console.log('focus first button')
                    firstButton.focus()
                    // setTimeout needed or else it over scroll element
                    setTimeout(() => firstButton.scrollIntoView(), 200)
                  }
                } else if (evt.key === 'Escape') {
                  console.log('---key escape')
                  handleDialogClose()
                }
              }}
            />
            <ComboBoxSearchInpClearBtn testId="search-clear" padding={2} onClick={() => handleOnSelectChange('')}>
              <RCEditClear className="svg-tooltip" />
            </ComboBoxSearchInpClearBtn>
          </ComboBoxSearchInpWrapper>
          <IconButton testId="search-close" opacity={1} padding={2} onClick={handleDialogClose}>
            <Icon name="Close" size={32} aria-label="Close" />
          </IconButton>
        </Box>

        {/* LIST */}
        <ComboBoxListWrapper ref={listRef} boxHeight={listBoxHeight ?? '50vh'} topContentHeight={topContentHeight}>
          {result.length > 0 ? (
            <ItemsWrapper
              ref={ref}
              count={items.length}
              className={isVisible ? 'visible' : ''}
              onKeyDown={(evt) => {
                // scroll up/down list
                const activeElement = document.activeElement

                if (evt.key === 'ArrowUp') {
                  console.log('item key arrow up')
                  const previousButton = activeElement?.parentElement?.previousElementSibling
                  if (previousButton) {
                    previousButton.querySelector('button')?.focus()
                  } else if (inputRef?.current) {
                    inputRef.current.focus()
                  }
                } else if (evt.key === 'ArrowDown') {
                  console.log('item key arrow dowm')
                  const nextButton = activeElement?.parentElement?.nextElementSibling
                  if (nextButton) {
                    nextButton.querySelector('button')?.focus({ preventScroll: true })
                  }
                } else if (evt.key === 'Escape') {
                  console.log('item key arrow escape')
                  handleDialogClose()
                }
              }}
            >
              {result.map((item, idx) => {
                return (
                  <SearchSelectListItem
                    key={item.key}
                    state={state}
                    item={item}
                    onSelectionChange={onSelectionChange}
                  />
                )
              })}
            </ItemsWrapper>
          ) : !!filterValue ? (
            <ComboBoxListNoResult>{t`No token found for "${filterValue}"`}</ComboBoxListNoResult>
          ) : (
            <SpinnerWrapper vSpacing={5}>
              <Spinner />
            </SpinnerWrapper>
          )}
        </ComboBoxListWrapper>
      </Box>
    </>
  )
}

const Wrapper = styled.div`
  //max-height: 50px;
`

const ItemsWrapper = styled.ul<{ count: number }>`
  // height: ${({ count }) => `${count * 34}px`};
  height: ${() => `${34 * 5}px`};
  overflow-x: auto;
`

const ComboBoxSearchInpWrapper = styled(InputProvider)`
  align-items: center;
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-column-gap: var(--spacing-2);
  position: relative;
  transition: 3s;
`

const ComboBoxSearchInpClearBtn = styled(IconButton)`
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

const ComboBoxCheckbox = styled(Checkbox)`
  margin-left: var(--spacing-3);
`

const ComboBoxListWrapper = styled.div<{ boxHeight: string; topContentHeight: number | undefined }>`
  overflow-x: hidden;
  overflow-y: scroll;
`

// ${({ topContentHeight }) => {
//   if (topContentHeight) {
//     return `height: calc(100vh - ${topContentHeight}px);`
//   }
// }};
//
// @media (min-width: ${breakpoints.sm}rem) {
//   height: ${({ boxHeight }) => boxHeight};
// }

const ComboBoxListNoResult = styled.li`
  text-align: center;
  padding: var(--spacing-wide) var(--spacing-2);
`

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  height: 100%;
  border: 0.5px solid var(--input_button--border-color);
  box-shadow: inset -2px -2px 0px 0.25px var(--box--primary--shadow-color);
`

function _filter<T>(filterValue: string, endsWith: EndsWith, items: Node<T>[], filterKeys: string[]) {
  const fuse = new Fuse<Node<T>>(items, {
    ignoreLocation: true,
    threshold: 0.01,
    keys: filterKeys,
  })

  const result = fuse.search(filterValue)

  if (result.length > 0) {
    return result.map((r) => r.item)
  } else {
    return items.filter((item) => endsWith(item.key as string, filterValue))
  }
}

export default SelectSearchList
