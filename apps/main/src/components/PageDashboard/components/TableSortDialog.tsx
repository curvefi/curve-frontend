import Box from '@/ui/Box'
import ModalDialog, { OpenDialogButton } from '@/ui/Dialog'
import Icon from '@/ui/Icon'
import { Radio, RadioGroup } from '@/ui/Radio'
import { Chip } from '@/ui/Typography'
import { useOverlayTriggerState } from '@react-stately/overlays'
import styled from 'styled-components'
import type { FormValues, Order, SortId, TableLabel } from '@/components/PageDashboard/types'


import useStore from '@/store/useStore'


const sortOrder = {
  asc: { label: 'Ascending', icon: <Icon name="ArrowUp" size={24} /> },
  desc: { label: 'Descending', icon: <Icon name="ArrowDown" size={24} /> },
}

const TableSortDialog = ({
  className,
  tableLabel,
  updateFormValues,
}: {
  className?: string
  tableLabel: TableLabel
  updateFormValues: (updatedFormValues: Partial<FormValues>) => void
}) => {
  let overlayTriggerState = useOverlayTriggerState({})
  const formValues = useStore((state) => state.dashboard.formValues)
  const setFormValues = useStore((state) => state.dashboard.setFormValues)

  const { sortBy, sortByOrder } = formValues

  const handleRadioGroupChange = (val: string) => {
    const [sortBy, sortByOrder] = val.split('-')
    updateFormValues({ sortBy: sortBy as SortId, sortByOrder: sortByOrder as Order })
    overlayTriggerState.close()
  }

  const value = `${sortBy}-${sortByOrder}`
  const btnLabel = tableLabel[sortBy].mobile ? tableLabel[sortBy].mobile : tableLabel[sortBy].name

  return (
    <Box className={className}>
      <OpenDialogButton overlayTriggerState={overlayTriggerState} showCaret variant="icon-outlined">
        {btnLabel ? (
          <Box>
            <ButtonText>{btnLabel}</ButtonText> <Chip className="chip vertical-align-middle">({sortByOrder})</Chip>
          </Box>
        ) : (
          'Sort By'
        )}
      </OpenDialogButton>
      {overlayTriggerState.isOpen && (
        <ModalDialog title="Type" state={{ ...overlayTriggerState, close: () => overlayTriggerState.close() }}>
          <SortHeader>
            <StyledChip>Asc</StyledChip> <StyledChip>Desc</StyledChip>
          </SortHeader>
          <RadioGroup aria-label={`Type`} onChange={handleRadioGroupChange} value={`${sortBy}-${sortByOrder}`}>
            {Object.entries(tableLabel).map(([key, { name, mobile }]) => {
              const tableLabel = mobile ? mobile : name
              return (
                <RadioWrapper
                  key={key}
                  flex
                  flexAlignItems="center"
                  flexJustifyContent="space-between"
                  padding="var(--spacing-2) 0"
                >
                  {tableLabel}{' '}
                  <RadiosWrapper grid gridTemplateColumns="repeat(2, auto)">
                    {Object.entries(sortOrder).map(([orderKey, { label, icon: IconComp }]) => {
                      return (
                        <StyledRadio
                          key={orderKey}
                          aria-label={`Sort by ${tableLabel} ${label}`}
                          isCustom
                          className={value === `${key}-${orderKey}` ? 'selected' : ''}
                          value={`${key}-${orderKey}`}
                        >
                          {IconComp}
                        </StyledRadio>
                      )
                    })}
                  </RadiosWrapper>
                </RadioWrapper>
              )
            })}
          </RadioGroup>
        </ModalDialog>
      )}
    </Box>
  )
}

TableSortDialog.defaultProps = {
  className: '',
}

const SortHeader = styled.header`
  display: flex;
  justify-content: flex-end;
`

const StyledRadio = styled(Radio)`
  padding: var(--spacing-2);
  border: 1px solid var(--border-400);

  &.selected {
    color: var(--button_filled--active--background-color);
    border: 1px solid var(--radio--selected--border-color);
    background-color: var(--radio--selected--background-color);
  }
`

const StyledChip = styled(Chip)`
  text-transform: uppercase;
  width: 2.563rem;
  text-align: center;
`

const RadiosWrapper = styled(Box)`
  ${StyledRadio}:first-of-type:not(.selected) {
    border-right: none;
  }
`

const RadioWrapper = styled(Box)`
  font-weight: var(--font-weight--bold);
`

const ButtonText = styled.span`
  vertical-align: middle;
`

export default TableSortDialog
