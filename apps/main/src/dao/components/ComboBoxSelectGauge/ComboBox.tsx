import type { ComboBoxSelectGaugeProps } from '@/dao/components/ComboBoxSelectGauge/types'

import React, { useEffect, useRef, useState } from 'react'
import { t } from '@ui-kit/lib/i18n'
import chunk from 'lodash/chunk'
import styled from 'styled-components'

import { breakpoints } from '@ui/utils/responsive'
import useStore from '@/dao/store/useStore'

import { RCEditClear } from '@ui/images'
import { StyledInput } from '@ui/InputComp/styles'
import Box from '@ui/Box/Box'
import ComboBoxListChunk from '@/dao/components/ComboBoxSelectGauge/ComboBoxListChunk'
import Icon from '@ui/Icon'
import IconButton from '@ui/IconButton/IconButton'
import InputProvider from '@ui/InputComp/InputProvider'
import Popover from '@ui/Popover/Popover'
import Spinner from '@ui/Spinner'
import SpinnerWrapper from '@ui/Spinner/SpinnerWrapper'
import { GaugeFormattedData } from '@/dao/types/dao.types'

const ComboBox = ({
  testId,
  dialogClose,
  imageBaseUrl,
  listBoxHeight,
  result,
  selectedGauge,
  showInpSearch,
  gauges,
  handleInpChange,
  handleOnSelectChange,
}: Pick<ComboBoxSelectGaugeProps, 'testId' | 'imageBaseUrl' | 'listBoxHeight' | 'showInpSearch' | 'gauges'> & {
  dialogClose: () => void
  result: GaugeFormattedData[] | undefined
  selectedGauge: GaugeFormattedData | null
  handleInpChange(filterValue: string, gauges: GaugeFormattedData[] | undefined): void
  handleOnSelectChange(selectedAddress: string): void
}) => {
  const topContentRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const [topContentHeight, setTopContentHeight] = useState<number | undefined>()

  const filterValue = useStore((state) => state.gauges.selectGaugeFilterValue)

  useEffect(() => {
    if (topContentRef?.current) {
      setTopContentHeight(topContentRef.current.getBoundingClientRect().height)
    }
  }, [topContentRef])

  return (
    <>
      <Popover data-testid={`modal-${testId}`} popoverRef={popoverRef} isOpen onClose={() => {}}>
        <Box grid gridGap={3}>
          {showInpSearch && (
            <Box ref={topContentRef} grid gridTemplateRows="auto 1fr" gridRowGap={3}>
              {showInpSearch && (
                <Box grid gridColumnGap={1} gridTemplateColumns="1fr auto" margin="1.5rem 0.5rem 0 1rem">
                  <ComboBoxSearchInpWrapper id="inp-search">
                    <Icon name="Search" size={24} aria-label="search icon" />
                    <StyledInput
                      ref={inputRef}
                      id="select-inp"
                      data-testid={`inp-search-${testId}`}
                      aria-label={t`Search by gauge name or address`}
                      placeholder={t`Search by gauge name or address`}
                      type="search"
                      value={filterValue}
                      onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) =>
                        handleInpChange(value, gauges)
                      }
                      onKeyDown={(evt) => {
                        // scroll to first item on list
                        if (evt.key === 'ArrowDown' && result && result.length > 0 && listRef.current) {
                          const visibleList = listRef.current.querySelector('.visible')
                          const firstButton = visibleList?.querySelector?.('button')

                          if (firstButton) {
                            firstButton.focus()
                            // setTimeout needed or else it over scroll element
                            setTimeout(() => firstButton.scrollIntoView(), 200)
                          }
                        } else if (evt.key === 'Escape') {
                          dialogClose()
                        }
                      }}
                    />
                    <ComboBoxSearchInpClearBtn
                      testId="search-clear"
                      padding={2}
                      onClick={() => handleOnSelectChange('')}
                    >
                      <RCEditClear className="svg-tooltip" />
                    </ComboBoxSearchInpClearBtn>
                  </ComboBoxSearchInpWrapper>
                  <IconButton testId="search-close" opacity={1} padding={2} onClick={dialogClose}>
                    <Icon name="Close" size={32} aria-label="Close" />
                  </IconButton>
                </Box>
              )}
            </Box>
          )}

          {/* LIST */}
          <ComboBoxListWrapper ref={listRef} boxHeight={listBoxHeight ?? '50vh'} topContentHeight={topContentHeight}>
            {Array.isArray(result) && result.length > 0 ? (
              chunk(result, 30).map((gauges, idx) => (
                <ComboBoxListChunk
                  key={`gauges-${idx}`}
                  testId={testId}
                  imageBaseUrl={imageBaseUrl}
                  inputRef={inputRef}
                  selectedGauge={selectedGauge}
                  gauges={gauges}
                  dialogClose={dialogClose}
                  handleOnSelectChange={handleOnSelectChange}
                />
              ))
            ) : !!filterValue ? (
              <ComboBoxListNoResult>{t`No gauge found for "${filterValue}"`}</ComboBoxListNoResult>
            ) : (
              <SpinnerWrapper vSpacing={5}>
                <Spinner />
              </SpinnerWrapper>
            )}
          </ComboBoxListWrapper>
        </Box>
      </Popover>
    </>
  )
}

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

const ComboBoxListWrapper = styled.div<{ boxHeight: string; topContentHeight: number | undefined }>`
  overflow-x: hidden;
  overflow-y: scroll;
  ${({ topContentHeight }) => {
    if (topContentHeight) {
      return `height: calc(100vh - ${topContentHeight}px);`
    }
  }};

  @media (min-width: ${breakpoints.sm}rem) {
    height: ${({ boxHeight }) => boxHeight};
  }
`

const ComboBoxListNoResult = styled.li`
  text-align: center;
  padding: var(--spacing-wide) var(--spacing-2);
`

export default ComboBox
