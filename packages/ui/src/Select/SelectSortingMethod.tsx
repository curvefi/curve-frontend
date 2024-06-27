import type { SelectProps } from 'ui/src/Select/Select'

import { Item } from 'react-stately'
import styled from 'styled-components'

import Select from 'ui/src/Select'

type ItemObj = {
  label: string
  key: string
}

export function SelectSortingMethod<T extends object>({ ...props }: Omit<SelectProps<T>, 'children'>) {
  return (
    <Select {...props} aria-label="Sort By" label="">
      {(item) => {
        const { label, key } = item as ItemObj
        return (
          <StyledItem key={key} textValue={label}>
            <strong>{label}</strong>
          </StyledItem>
        )
      }}
    </Select>
  )
}

const StyledItem = styled(Item)`
  display: flex;
  flex-wrap: no-wrap;
`

export default SelectSortingMethod
