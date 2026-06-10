import { useRef } from 'react'
import { useOption } from 'react-aria'
import type { ListState, Node } from 'react-stately'
import { styled } from 'styled-components'

export function SelectModalListBoxItem<T>({ item, state }: { item: Node<T>; state: ListState<T> }) {
  const ref = useRef<HTMLLIElement>(null)
  const { optionProps } = useOption(item, state, ref)
  return (
    <StyledOption {...optionProps} ref={ref}>
      {item.rendered}
    </StyledOption>
  )
}

SelectModalListBoxItem.displayName = 'SelectModalListBoxItem'

const StyledOption = styled.li`
  align-items: center;
  color: var(--dropdown--color);
  cursor: pointer;
  display: flex;
  outline: none;
  padding: var(--spacing-2);

  &[tabindex='0'][aria-selected='false'] {
    color: var(--dropdown--hover--color);
    background-color: var(--dropdown--hover--background-color);
  }

  &[aria-selected='true'] {
    color: var(--dropdown--active--color);
    background-color: var(--dropdown--active--background-color);
  }
`
