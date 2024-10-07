
import * as React from 'react'
import type { SelectState } from 'react-stately'
import styled from 'styled-components'


import DelayRender from 'ui/src/DelayRender'
import ModalDialog from 'ui/src/Dialog'
import { Radio, RadioGroup } from 'ui/src/Radio'
import { delayAction } from 'ui/src/utils'

function SelectModalFull<T>({
  title,
  state,
  onSelectionChange,
}: {
  title: string
  state: SelectState<T>
  onSelectionChange: ((key: React.Key) => any) | undefined
}) {
  const handleRadioGroupChange = (updatedKey: string) => {
    if (typeof onSelectionChange === 'function') onSelectionChange(updatedKey)
    delayAction(state.close)
  }

  return (
    <DelayRender>
      <ModalDialog title={title} state={state}>
        <RadioGroup aria-label={title} onChange={handleRadioGroupChange} value={state.selectedKey.toString()}>
          {[...state.collection].map((item) => {
            const value = item.key.toString()
            return (
              <StyledRadio key={item.key} value={value} aria-label={value}>
                {item.rendered}
              </StyledRadio>
            )
          })}
        </RadioGroup>
      </ModalDialog>
    </DelayRender>
  )
}

SelectModalFull.displayName = 'SelectModalFull'

const StyledRadio = styled(Radio)`
  min-height: var(--height-medium);
`

export default SelectModalFull
