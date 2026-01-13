import { styled } from 'styled-components'
import { useDashboardContext } from '@/dex/components/PageDashboard/dashboardContext'
import type { Order, SortId, TableLabel } from '@/dex/components/PageDashboard/types'
import { useOverlayTriggerState } from '@react-stately/overlays'
import { Box } from '@ui/Box'
import { ModalDialog } from '@ui/Dialog/ModalDialog'
import { OpenDialogButton } from '@ui/Dialog/OpenDialogButton'
import { Icon } from '@ui/Icon'
import { Radio, RadioGroup } from '@ui/Radio'
import { Chip } from '@ui/Typography'

const sortOrder = {
  asc: { label: 'Ascending', icon: <Icon name="ArrowUp" size={24} /> },
  desc: { label: 'Descending', icon: <Icon name="ArrowDown" size={24} /> },
}

type Props = {
  className?: string
  tableLabel: TableLabel
}

export const TableSortDialog = ({ className = '', tableLabel }: Props) => {
  const overlayTriggerState = useOverlayTriggerState({})

  const {
    formValues: { sortBy, sortByOrder },
    updateFormValues,
  } = useDashboardContext()

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
                    {Object.entries(sortOrder).map(([orderKey, { label, icon: IconComp }]) => (
                      <StyledRadio
                        key={orderKey}
                        aria-label={`Sort by ${tableLabel} ${label}`}
                        isCustom
                        className={value === `${key}-${orderKey}` ? 'selected' : ''}
                        value={`${key}-${orderKey}`}
                      >
                        {IconComp}
                      </StyledRadio>
                    ))}
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
