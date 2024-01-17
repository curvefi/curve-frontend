import type { FormValues, Order, TableLabel, SortKey } from '@/components/PageMarketList/types'

import { t } from '@lingui/macro'
import { useOverlayTriggerState } from '@react-stately/overlays'
import React, { useMemo } from 'react'
import styled from 'styled-components'

import { delayAction } from '@/utils/helpers'
import { Chip } from '@/ui/Typography'
import { Radio, RadioGroup } from '@/ui/Radio'
import Box from '@/ui/Box'
import Icon from '@/ui/Icon'
import ModalDialog, { OpenDialogButton } from '@/ui/Dialog'

const sortOrder = {
  asc: { label: 'Ascending', icon: <Icon name="ArrowUp" size={24} /> },
  desc: { label: 'Descending', icon: <Icon name="ArrowDown" size={24} /> },
}

type Props = {
  formValues: FormValues
  tableLabels: TableLabel
  updateFormValues: (formValues: Partial<FormValues>) => void
}

const DialogSortContent = ({ formValues, tableLabels, updateFormValues }: Props) => {
  let overlayTriggerState = useOverlayTriggerState({})

  const handleRadioGroupChange = (updatedSortValue: string) => {
    const [sortBy, sortByOrder] = updatedSortValue.split('-')

    const updatedFormValues: FormValues = {
      ...formValues,
      sortBy: sortBy as SortKey,
      sortByOrder: sortByOrder as Order,
    }

    updateFormValues(updatedFormValues)
    delayAction(overlayTriggerState.close)
  }

  const sortLabel = useMemo(() => {
    let label: React.ReactNode | '' = ''

    if (formValues.sortBy) {
      const foundLabel = tableLabels[formValues.sortBy]
      if (foundLabel) {
        label = foundLabel.name
      }
    }
    return label
  }, [formValues.sortBy, tableLabels])

  const value = `${formValues.sortBy}-${formValues.sortByOrder}`

  return (
    <Box>
      <OpenDialogButton overlayTriggerState={overlayTriggerState} showCaret variant="icon-outlined">
        {sortLabel ? (
          <Box>
            <ButtonText>{sortLabel}</ButtonText>{' '}
            <Chip className="chip vertical-align-middle">({formValues.sortByOrder})</Chip>
          </Box>
        ) : (
          t`Sort By`
        )}
      </OpenDialogButton>
      {overlayTriggerState.isOpen && (
        <ModalDialog title="Type" state={{ ...overlayTriggerState, close: () => overlayTriggerState.close() }}>
          <SortHeader>
            <StyledChip>{t`Asc`}</StyledChip> <StyledChip>{t`Desc`}</StyledChip>
          </SortHeader>
          <RadioGroup aria-label="Type" onChange={handleRadioGroupChange} value={value}>
            {Object.entries(tableLabels).map(([key, { name: tableLabel }]) => {
              return (
                <RadioWrapper key={key}>
                  {tableLabel}{' '}
                  <RadiosWrapper>
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

const RadiosWrapper = styled.div`
  display: grid;
  grid-template-columns: repeat(2, auto);

  ${StyledRadio}:first-of-type:not(.selected) {
    border-right: none;
  }
`

const RadioWrapper = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: var(--spacing-2) 0;

  font-weight: var(--font-weight--bold);
`

const ButtonText = styled.span`
  vertical-align: middle;
`

export default DialogSortContent
