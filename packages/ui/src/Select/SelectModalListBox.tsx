import type { AriaListBoxOptions } from 'react-aria'
import type { SelectState } from 'react-stately'

import * as React from 'react'
import { useListBox } from 'react-aria'
import styled from 'styled-components'

import SelectModalListBoxItem from 'ui/src/Select/SelectModalListBoxItem'

function SelectModalListBox<T>(
  props: AriaListBoxOptions<T> & {
    state: SelectState<T>
    listBoxRef?: React.RefObject<HTMLUListElement>
  }
) {
  const ref = React.useRef<HTMLUListElement>(null)
  const { listBoxRef = ref, state } = props
  const { listBoxProps } = useListBox(props, state, listBoxRef)

  return (
    <StyledListBox {...listBoxProps} ref={listBoxRef}>
      {[...state.collection].map((item) => {
        return <SelectModalListBoxItem key={item.key} state={state} item={item} />
      })}
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
  ${({ minWidth }) => minWidth && `min-width: ${minWidth};`}//overflow: auto;
`

export default SelectModalListBox
