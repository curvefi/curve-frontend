import { styled } from 'styled-components'
import { Popover2Dialog, Popover2Trigger as Popover } from 'ui/src/Popover2'
import { DialogSelectChart as DialogSelectContent } from '@ui-kit/features/candle-chart/DialogSelectChartContent'
import type { LabelList } from './types'

type Props = {
  selectedChartIndex: number
  selectChartList: LabelList[]
  isDisabled: boolean
  setChartSelectedIndex: (index: number) => void
}

export const DialogSelect = ({ selectedChartIndex, selectChartList, setChartSelectedIndex, isDisabled }: Props) => (
  <>
    {selectChartList.length === 1 ? (
      <ChartsTitle>{selectChartList[0]?.label ?? `Loading`}</ChartsTitle>
    ) : (
      <Popover
        buttonProps={{ isDisabled }}
        placement="bottom"
        offset={0}
        buttonStyles={{ padding: '0.5rem' }}
        label={<h3>{selectChartList[selectedChartIndex]?.label ?? `Loading`}</h3>}
        showExpandIcon
      >
        <StyledPopover2Dialog title={`Select Chart`}>
          <DialogSelectContent
            data={selectChartList}
            currentData={selectedChartIndex}
            setCurrentData={setChartSelectedIndex}
          />
        </StyledPopover2Dialog>
      </Popover>
    )}
  </>
)

const StyledPopover2Dialog = styled(Popover2Dialog)`
  display: flex;
  flex-direction: column;
  h3 {
    font-size: var(--font-size-2);
  }
`

const ChartsTitle = styled.h3`
  font-size: var(--font-size-3);
  margin: auto;
  padding-left: var(--spacing-2);
`
