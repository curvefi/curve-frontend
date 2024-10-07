import type { AriaListBoxOptions } from 'react-aria'
import type { Node } from '@react-types/shared'
import type { ListState } from '@react-stately/list'

import React, { useEffect, useRef, useState } from 'react'
import styled from 'styled-components'

import { useListBox, useOption } from '@react-aria/listbox'
import useIntersectionObserver from 'ui/src/hooks/useIntersectionObserver'

function ListBox<T extends object>(
  props: AriaListBoxOptions<T> & {
    activeKey: string
    listBoxRef: React.RefObject<HTMLUListElement>
    state: ListState<any>
    testId?: string
  }
) {
  const ref = useRef<HTMLUListElement>(null)
  const { listBoxRef = ref, state, testId } = props
  const { listBoxProps } = useListBox(props, state, listBoxRef)

  const [clientTop, setClientTop] = useState(0)

  useEffect(() => {
    if (listBoxRef.current) {
      // @ts-ignore
      const clientRect = listBoxRef.current.getBoundingClientRect()
      setClientTop(clientRect.top)
    }
  }, [listBoxRef])

  return (
    <Ul {...listBoxProps} data-testid={testId} ref={listBoxRef} clientTop={clientTop}>
      {/* @ts-ignore */}
      {[...state.collection].map((item) => (
        <Option key={item.key} item={item} activeKey={props.activeKey} state={state} />
      ))}
    </Ul>
  )
}

function Option<T>({ activeKey, item, state }: { activeKey: string; item: Node<T>; state: ListState<T> }) {
  const ref = useRef<HTMLLIElement>(null)
  const { optionProps, isDisabled, isFocused, isSelected } = useOption({ key: item.key }, state, ref)
  const entry = useIntersectionObserver(ref, { freezeOnceVisible: true })
  const isVisible = !!entry?.isIntersecting

  return (
    <ListItem
      {...optionProps}
      ref={ref}
      className={`${optionProps?.className ?? ''} ${isDisabled ? 'isDisabled' : ''} ${
        item.key === activeKey ? 'isActive' : ''
      } ${isFocused || isSelected ? 'selected' : ''}`}
    >
      {isVisible ? item.rendered : null}
    </ListItem>
  )
}

const ListItem = styled.li`
  display: flex;
  padding: 0.5rem 1rem;
  min-height: 3.125rem;

  color: var(--dropdown_button--color);
  cursor: pointer;
  outline: none;

  &:hover:not(.isActive):not(.isDisabled) {
    color: var(--dropdown--hover--color);
    background-color: var(--dropdown--hover--background-color);
  }

  &.isActive {
    color: var(--dropdown--active--color);
    background-color: var(--dropdown--active--background-color);
  }

  &.isSelected {
    color: var(--dropdown--hover--color);
    background-color: var(--dropdown--hover--background-color);
  }
`

type ULProps = {
  clientTop: number
}

const Ul = styled.ul<ULProps>`
  margin: 0;
  padding: 0;
  list-style: none;
  height: 100%;
  overflow-y: scroll;
`

export default ListBox
