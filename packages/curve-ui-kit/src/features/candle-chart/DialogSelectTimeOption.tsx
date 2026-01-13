import { styled } from 'styled-components'
import { Popover2Dialog, Popover2Trigger as Popover } from '@ui/Popover2'
import { DialogSelectChart as DialogSelectContent } from '@ui-kit/features/candle-chart/DialogSelectTimeOptionContent'
import type { TimeOptions } from './types'

type Props = {
  currentTimeOption: TimeOptions
  isDisabled: boolean
  setCurrentTimeOption: (timeOption: TimeOptions) => void
}

export const DialogSelect = ({ currentTimeOption, setCurrentTimeOption, isDisabled }: Props) => (
  <Popover
    buttonProps={{ isDisabled }}
    placement="bottom"
    offset={0}
    buttonStyles={{ padding: '0.5rem', border: '1px solid var(--nav_button--border-color)' }}
    label={<h3>{currentTimeOption}</h3>}
    showExpandIcon
    buttonVariant="outlined"
  >
    <StyledPopover2Dialog title={`Select Timeframe`}>
      <DialogSelectContent currentTimeOption={currentTimeOption} setCurrentTimeOption={setCurrentTimeOption} />
    </StyledPopover2Dialog>
  </Popover>
)

const StyledPopover2Dialog = styled(Popover2Dialog)`
  display: flex;
  flex-direction: column;
  h3 {
    font-size: var(--font-size-2);
    margin-right: auto;
  }
`
