import { RefObject, useRef } from 'react'
import type { AriaListBoxOptions } from 'react-aria'
import { useListBox } from 'react-aria'
import type { SelectState } from 'react-stately'
import { styled } from 'styled-components'
import { SelectModalListBoxItem } from '@ui/Select/SelectModalListBoxItem'

export function SelectModalListBox<T>(
  props: AriaListBoxOptions<T> & {
    state: SelectState<T>
    listBoxRef?: RefObject<HTMLUListElement | null>
  },
) {
  const ref = useRef<HTMLUListElement>(null)
  const { listBoxRef = ref, state } = props
  const { listBoxProps } = useListBox(props, state, listBoxRef)

  return (
    <StyledListBox {...listBoxProps} ref={listBoxRef}>
      {[...state.collection].map((item) => (
        <SelectModalListBoxItem key={item.key} state={state} item={item} />
      ))}
    </StyledListBox>
  )
}

SelectModalListBox.displayName = 'SelectModalListBox'

const StyledListBox = styled.ul<{ minWidth?: string }>`
  background-color: var(--page--background-color);
  border: 3px solid var(--dropdown--background-color);
  box-shadow: 6px 6px 0 var(--box--primary--shadow-color);
  font-size: var(--font-size-2);
  max-height: 80vh;
  overflow-x: auto;
  ${({ minWidth }) => minWidth && `min-width: ${minWidth};`}//overflow: auto;
`
