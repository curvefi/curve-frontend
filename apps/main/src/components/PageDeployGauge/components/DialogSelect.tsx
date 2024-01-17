import React from 'react'
import styled from 'styled-components'

import DialogSelectContent from '@/components/PageDeployGauge/components/DialogSelectContent'
import Popover, { Popover2Dialog } from '@/ui/Popover2'

type Props = {
  currentData: string | null
  data: string[]
  isDisabled: boolean
  label: string
  setCurrentData: (data: string) => void
}

const DialogSelect = ({ currentData, data, setCurrentData, isDisabled, label }: Props) => {
  return (
    <Popover
      buttonProps={{ isDisabled }}
      placement="bottom"
      offset={0}
      buttonStyles={{ padding: '0.5rem' }}
      label={
        <StyledDropdownLabel>{currentData === null || currentData === '' ? label : currentData}</StyledDropdownLabel>
      }
      showExpandIcon
    >
      <StyledPopover2Dialog title={label}>
        <DialogSelectContent data={data} currentData={currentData} setCurrentData={setCurrentData} />
      </StyledPopover2Dialog>
    </Popover>
  )
}

const StyledDropdownLabel = styled.h3`
  font-size: var(--font-size-2);
`

const StyledPopover2Dialog = styled(Popover2Dialog)`
  display: flex;
  flex-direction: column;
  h3 {
    font-size: var(--font-size-2);
    padding-left: var(--spacing-2);
    padding-right: var(--spacing-2);
    margin-right: auto;
    opacity: 0.7;
  }
`

export default DialogSelect
