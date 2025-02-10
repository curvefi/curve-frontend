import type { ConnectState } from 'ui/src/utils'
import type { SelectProps } from 'ui/src/Select/Select'

import * as React from 'react'
import { Item } from 'react-stately'

import Select from 'ui/src/Select'
import SelectNetworkItem from 'ui/src/SelectNetwork/SelectNetworkItem'

export type SelectNetworkItem = {
  label: string
  chainId: number
  src: string
  srcDark: string
}

type SelectNetworkProps = Omit<SelectProps<SelectNetworkItem>, 'children'> & {
  connectState: ConnectState
  hideIcon?: boolean
  isDarkTheme?: boolean
}

/*
 * If an image is not displaying, ensure it has been added to the repository at:
 * https://github.com/curvefi/curve-assets/tree/main/chains.
 */
export const SelectNetwork: React.FC<SelectNetworkProps> = ({
  className = '',
  connectState,
  hideIcon,
  isDarkTheme,
  items,
  ...props
}) => (
  // TODO: add darkTheme icon or make sure icon work for both dark and light theme
  <Select {...props} className={className} items={items} aria-label="Select network" label="">
    {({ chainId, src, label }: SelectNetworkItem) => (
      <Item key={chainId} textValue={chainId.toString()}>
        {!hideIcon && <SelectNetworkItem label={label} src={src} fallbackSrc={src} />}
        <strong>{label}</strong>
      </Item>
    )}
  </Select>
)

SelectNetwork.displayName = 'SelectNetwork'
export default SelectNetwork
