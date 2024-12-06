import type { ComboBoxStateOptions } from 'react-stately'

import React, { useRef } from 'react'
import { useButton, useComboBox, useFocusRing } from 'react-aria'
import { useComboBoxState } from '@react-stately/combobox'
import styled from 'styled-components'

import { breakpoints } from 'ui/src/utils/responsive'
import { RCEditClear } from 'ui/src/images'
import { StyledInput } from 'ui/src/InputComp/styles'
import Box from 'ui/src/Box/Box'
import Icon from 'ui/src/Icon'
import IconButton from 'ui/src/IconButton/IconButton'
import InputProvider from 'ui/src/InputComp/InputProvider'
import ListBox from 'ui/src/DialogComboBox/ListBox'
import Popover from 'ui/src/Popover/Popover'

function ComboBox<T extends object>({
  listBoxHeight,
  onClose,
  showSearch,
  testId,
  updateFilterValue,
  ...props
}: ComboBoxStateOptions<T> & {
  activeKey: string
  onClose?: () => void
  quickList?: React.ReactNode
  listBoxHeight?: string
  isListboxOpenPermanently: boolean
  showSearch?: boolean
  testId?: string
  updateFilterValue: (filterValue: string) => void
}) {
  const { focusProps } = useFocusRing()
  const state = useComboBoxState(props)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const topContentRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listBoxRef = useRef<HTMLUListElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const topContentHeight = topContentRef?.current?.getBoundingClientRect()?.height

  const { listBoxProps, inputProps } = useComboBox(
    {
      ...props,
      inputRef,
      listBoxRef,
      popoverRef,
    },
    state,
  )

  const { buttonProps: closeButtonProps } = useButton(
    {
      onPress: () => {
        if (typeof onClose === 'function') onClose()
      },
    },
    closeButtonRef,
  )

  return (
    <Popover
      data-testid={`modal-${testId}`}
      popoverRef={popoverRef}
      isOpen={props.isListboxOpenPermanently || state.isOpen}
      onClose={state.close}
    >
      {showSearch && (
        <Box ref={topContentRef} grid gridTemplateRows="auto 1fr" gridRowGap={3}>
          <Header grid gridColumnGap={1} gridTemplateColumns="1fr auto">
            <StyledInputWrapper id="inp-search">
              <Icon name="Search" size={24} aria-label="search icon" />
              <StyledInput
                {...inputProps}
                data-testid={`inp-search-${testId}`}
                ref={inputRef}
                type="search"
                onChange={({ target: { value } }: React.ChangeEvent<HTMLInputElement>) => {
                  // override inputProps onChange
                  updateFilterValue(value)
                }}
              />
              <StyledIconButton
                className={!!inputProps.value ? 'show' : ''}
                padding={2}
                testId="search-clear"
                onClick={() => updateFilterValue('')}
              >
                <RCEditClear className="svg-tooltip" />
              </StyledIconButton>
            </StyledInputWrapper>
            <IconButton
              opacity={1}
              {...closeButtonProps}
              {...focusProps}
              ref={closeButtonRef}
              padding={2}
              testId="search-close"
            >
              <Icon name="Close" size={32} aria-label="Close" />
            </IconButton>
          </Header>

          {props.quickList}
        </Box>
      )}

      <ListBoxWrapper boxHeight={listBoxHeight ?? '50vh'} topContentHeight={topContentHeight}>
        <ListBox
          {...listBoxProps}
          activeKey={props.activeKey}
          shouldUseVirtualFocus
          listBoxRef={listBoxRef}
          state={state}
          testId={`list-${testId}`}
        />
      </ListBoxWrapper>
    </Popover>
  )
}

const ListBoxWrapper = styled.div<{ boxHeight: string; topContentHeight: number | undefined }>`
  margin-top: var(--spacing-3);
  ${({ topContentHeight }) => {
    if (topContentHeight) {
      return `height: calc(100vh - ${topContentHeight}px);`
    }
  }};

  @media (min-width: ${breakpoints.sm}rem) {
    height: ${({ boxHeight }) => boxHeight};
  }
`

const Header = styled(Box)`
  margin: 1.5rem 0.5rem 0 1rem;
`

const StyledIconButton = styled(IconButton)`
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

const StyledInputWrapper = styled(InputProvider)`
  align-items: center;
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-column-gap: var(--spacing-2);
  position: relative;
  transition: 3s;
`

export default ComboBox
