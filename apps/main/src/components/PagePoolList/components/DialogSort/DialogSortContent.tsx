import type { PoolListTableLabel } from '@/components/PagePoolList/types'

import { t } from '@lingui/macro'
import React from 'react'
import styled from 'styled-components'

import { Chip } from '@/ui/Typography'
import { Radio, RadioGroup } from '@/ui/Radio'
import Icon from '@/ui/Icon'

const sortOrder = {
  asc: { label: 'Ascending', icon: <Icon name="ArrowUp" size={24} /> },
  desc: { label: 'Descending', icon: <Icon name="ArrowDown" size={24} /> },
}

type Props = {
  tableLabels: PoolListTableLabel
  value: string
  toggle?: () => void
  handleRadioGroupChange(updatedSortValue: string, cb: (() => void) | undefined): void
}

const DialogSortContent = ({ tableLabels, value, handleRadioGroupChange, toggle }: Props) => {
  return (
    <>
      <SortHeader>
        <StyledChip>{t`Asc`}</StyledChip> <StyledChip>{t`Desc`}</StyledChip>
      </SortHeader>
      <RadioGroup
        aria-label="Type"
        onChange={(updatedSortValue) => handleRadioGroupChange(updatedSortValue, toggle)}
        value={value}
      >
        {Object.entries(tableLabels).map(([key, { name, mobile }]) => {
          const tableLabel = mobile ? mobile : name
          return (
            <RadioWrapper key={key}>
              {tableLabel}
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
    </>
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
  margin-left: 2rem;

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

export default DialogSortContent
