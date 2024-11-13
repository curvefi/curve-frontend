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
 *
 * The `darkSrc` property is optional. Only include a `darkSrc` if the image does not display correctly in dark theme.
 */
export const SelectNetwork: React.FC<SelectNetworkProps> = ({
  className = '',
  connectState,
  hideIcon,
  isDarkTheme,
  items,
  ...props
}) => {
  const selectItems = React.useMemo(() => {
    if (!items) return []

    if (isDarkTheme) {
      return Array.from(items, ({ src, srcDark, ...rest }) => ({ src: srcDark, fallbackSrc: src, ...rest }))
    }

    return Array.from(items, ({ src, srcDark, ...rest }) => ({ src, fallbackSrc: src, ...rest }))
  }, [items, isDarkTheme])

  return (
    <Select {...props} className={className} items={selectItems} aria-label="Select network" label="">
      {({ chainId, src, fallbackSrc, label }) => (
        <Item key={chainId} textValue={chainId.toString()}>
          {!hideIcon && <SelectNetworkItem label={label} src={src} fallbackSrc={fallbackSrc} />}
          <strong>{label}</strong>
        </Item>
      )}
    </Select>
  )
}

SelectNetwork.displayName = 'SelectNetwork'
export default SelectNetwork
