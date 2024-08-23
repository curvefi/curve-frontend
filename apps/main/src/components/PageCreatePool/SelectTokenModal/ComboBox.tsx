import type { ComboBoxStateOptions } from 'react-stately'

import { useButton, useComboBox, useFocusRing } from 'react-aria'
import { useComboBoxState } from '@react-stately/combobox'
import React, { ChangeEvent, useCallback, useMemo, useRef } from 'react'
import styled from 'styled-components'
import { t } from '@lingui/macro'

import debounce from 'lodash/debounce'

import Icon from '@/ui/Icon'
import InputWrapper from '@/ui/InputComp'
import { ListBox } from '@/ui/DialogComboBox'
import { StyledInput } from '@/ui/InputComp/styles'
import { ReactComponent as EditClearSymbolic } from '@/images/edit-clear-symbolic.svg'
import IconButton from '@/ui/IconButton'
import Box from '@/ui/Box'
import Popover from '@/ui/Popover'

type Props = {
  activeKey: string
  onClose?: () => void
  quickList?: React.ReactNode
  listBoxHeight?: string
  isListboxOpenPermanently: boolean
  showSearch: boolean
}

function ComboBox<T extends object>({ listBoxHeight, onClose, showSearch, ...props }: ComboBoxStateOptions<T> & Props) {
  const { focusProps } = useFocusRing()
  const state = useComboBoxState(props)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const topContentRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listBoxRef = useRef<HTMLUListElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  const topContentHeight = topContentRef?.current?.getBoundingClientRect()?.height

  const { listBoxProps } = useComboBox(
    {
      ...props,
      children: props.children ?? <></>,
      inputRef,
      listBoxRef,
      popoverRef,
    },
    state
  )

  const handleBtnClickClear = () => {
    if (inputRef.current) {
      inputRef.current.value = ''
      if (typeof props.onInputChange === 'function') props.onInputChange('')
    }
  }

  const handleInpChange = useCallback(
    (evt: ChangeEvent<HTMLInputElement>) => {
      if (typeof props.onInputChange === 'function') {
        props.onInputChange(evt.target.value)
      }
    },
    [props]
  )

  const debounceInpChange = useMemo(() => debounce(handleInpChange, 700), [handleInpChange])

  const { buttonProps: closeButtonProps } = useButton(
    {
      onPress: () => {
        if (typeof onClose === 'function') onClose()
      },
    },
    closeButtonRef
  )

  return (
    <Popover popoverRef={popoverRef} isOpen={props.isListboxOpenPermanently || state.isOpen} onClose={state.close}>
      {showSearch && (
        <StyledBox ref={topContentRef} grid gridTemplateRows="auto 1fr" gridRowGap={0}>
          <Header grid gridColumnGap={1} gridTemplateColumns="1fr auto">
            <StyledInputWrapper id="inp-search">
              <Icon name={'Search'} size={24} aria-label="search icon" />

              <StyledInput placeholder={props.placeholder} ref={inputRef} type="search" onChange={debounceInpChange} />
              <StyledIconButton
                className={!!inputRef?.current?.value ? 'show' : ''}
                padding={2}
                onClick={handleBtnClickClear}
              >
                <EditClearSymbolic className="svg-tooltip" />
              </StyledIconButton>
            </StyledInputWrapper>
            <IconButton opacity={1} {...closeButtonProps} {...focusProps} ref={closeButtonRef} padding={2}>
              <Icon name={'Close'} size={32} aria-label="Close" />
            </IconButton>
            <p>{t`Type the full token address to add a new token`}</p>
          </Header>
          {props.quickList}
        </StyledBox>
      )}
      <ListBoxWrapper boxHeight={listBoxHeight ?? '50vh'} topContentHeight={topContentHeight}>
        <ListBox
          {...listBoxProps}
          activeKey={props.activeKey}
          shouldUseVirtualFocus
          listBoxRef={listBoxRef}
          state={state}
        />
      </ListBoxWrapper>
    </Popover>
  )
}

const ListBoxWrapper = styled.div<{ boxHeight: string; topContentHeight: number | undefined }>`
  padding-top: var(--spacing-3);

  ${({ topContentHeight }) => {
    if (topContentHeight) {
      return `height: calc(100vh - ${topContentHeight}px - 1px);`
    }
  }};

  @media (min-width: 28.125rem) {
    height: ${({ boxHeight }) => boxHeight};
  }
`

const StyledBox = styled(Box)`
  padding-top: var(--spacing-narrow);
  p {
    font-style: italic;
    font-size: var(--font-size-1);
    margin: var(--spacing-2) auto var(--spacing-2);
  }
`

const Header = styled(Box)`
  margin: 1rem 0.5rem 0 1rem;
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

const StyledInputWrapper = styled(InputWrapper)`
  align-items: center;
  display: grid;
  grid-template-columns: auto 1fr auto;
  grid-column-gap: var(--spacing-2);
  position: relative;
  transition: 3s;
`

export default ComboBox
