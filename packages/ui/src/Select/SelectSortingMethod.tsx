import { Item } from 'react-stately'
import { styled } from 'styled-components'
import Select from 'ui/src/Select'
import type { SelectProps } from 'ui/src/Select/Select'

type ItemObj = {
  label: string
  key: string
}

interface SelectSortingMethodProps extends Omit<SelectProps<ItemObj>, 'children'> {
  description?: string
}

export function SelectSortingMethod({ description, ...props }: SelectSortingMethodProps) {
  return (
    <Select {...props} aria-label="Sort By">
      {({ label, key }: ItemObj) => (
        <StyledItem key={key} textValue={label}>
          <strong>{label}</strong>
        </StyledItem>
      )}
    </Select>
  )
}

const StyledItem = styled(Item)`
  display: flex;
  flex-wrap: no-wrap;
`

export default SelectSortingMethod
