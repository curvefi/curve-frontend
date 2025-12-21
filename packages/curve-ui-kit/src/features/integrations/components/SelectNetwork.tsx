import { Item } from 'react-stately'
import styled from 'styled-components'
import Select from 'ui/src/Select'
import type { SelectProps } from 'ui/src/Select/Select'

export type SelectNetworkItem = {
  networkId: string
  chainId: number
}

type SelectNetworkProps = Omit<SelectProps<SelectNetworkItem>, 'children'> & {
  isDarkTheme?: boolean
}

export const SelectNetwork = ({ className = '', isDarkTheme, items, ...props }: SelectNetworkProps) => (
  <Select {...props} className={className} items={items} aria-label="Select network" label="">
    {({ chainId, networkId }: SelectNetworkItem) => (
      <Item key={chainId} textValue={chainId.toString()}>
        <Label>{networkId}</Label>
      </Item>
    )}
  </Select>
)

const Label = styled.span`
  font-weight: bold;
  text-transform: capitalize;
`

SelectNetwork.displayName = 'SelectNetwork'
export default SelectNetwork
