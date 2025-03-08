import { Item } from 'react-stately'
import styled from 'styled-components'
import Select from 'ui/src/Select'
import type { SelectProps } from 'ui/src/Select/Select'

interface SelectSortingMethodProps<T extends object> extends Omit<SelectProps<T>, 'children'> {
  description?: string
}

type ItemObj = {
  label: string
  key: string
}

export function SelectSortingMethod<T extends object>({ description, ...props }: SelectSortingMethodProps<T>) {
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
