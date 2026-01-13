import { styled } from 'styled-components'
import { Icon } from 'ui/src/Icon'
import { Radio, RadioGroup } from 'ui/src/Radio'
import type { LabelsMapper } from 'ui/src/TableSort/types'
import { Chip } from 'ui/src/Typography'

const sortOrder = {
  asc: { label: 'Ascending', icon: <Icon name="ArrowUp" size={24} /> },
  desc: { label: 'Descending', icon: <Icon name="ArrowDown" size={24} /> },
}

type Props = {
  labelsMapper: LabelsMapper
  value: string
  toggle?: () => void
  handleRadioGroupChange(updatedSortValue: string, cb: (() => void) | undefined): void
}

export const TableSortSelectOptions = ({ labelsMapper, value, handleRadioGroupChange, toggle }: Props) => (
  <>
    <SortHeader>
      <StyledChip>Asc</StyledChip> <StyledChip>Desc</StyledChip>
    </SortHeader>
    <RadioGroup
      aria-label="Type"
      onChange={(updatedSortValue) => handleRadioGroupChange(updatedSortValue, toggle)}
      value={value}
    >
      {Object.entries(labelsMapper).map(([key, { name, mobile }]) => {
        const tableLabel = mobile ? mobile : name
        return (
          <RadioWrapper key={key}>
            {tableLabel}
            <RadiosWrapper>
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
  </>
)

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
