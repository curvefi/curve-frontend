import type { LabelList } from './types'

import styled from 'styled-components'

import DialogSelectContent from 'ui/src/Chart/DialogSelectChartContent'
import Popover, { Popover2Dialog } from 'ui/src/Popover2'

type Props = {
  selectedChartIndex: number
  selectChartList: LabelList[]
  isDisabled: boolean
  setChartSelectedIndex: (index: number) => void
}

const DialogSelect = ({ selectedChartIndex, selectChartList, setChartSelectedIndex, isDisabled }: Props) => {
  return (
    <>
      {selectChartList.length === 1 ? (
        <ChartsTitle>{selectChartList[selectedChartIndex]?.label ?? `Loading`}</ChartsTitle>
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
}

const StyledPopover2Dialog = styled(Popover2Dialog)`
  display: flex;
  flex-direction: column;
  h3 {
    font-size: var(--font-size-2);
    text-align: center;
  }
`

const ChartsTitle = styled.h3`
  font-size: var(--font-size-2);
  margin: auto;
  padding-left: var(--spacing-2);
`

export default DialogSelect
