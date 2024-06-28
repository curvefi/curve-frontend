import type { SelectProps } from 'ui/src/Select/Select'

import * as React from 'react'
import { Item } from 'react-stately'
import styled from 'styled-components'

import Select from 'ui/src/Select'

type ItemObj = {
  icon: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  iconDarkTheme?: React.FunctionComponent<React.SVGProps<SVGSVGElement>>
  chainId: number
  label: string
}

export function SelectNetwork<T extends object>({
  hideIcon,
  isDarkTheme,
  items,
  ...props
}: Omit<SelectProps<T>, 'children'> & { hideIcon?: boolean; isDarkTheme?: boolean }) {
  const parsedItems = Object.entries(items ?? []).map(([_, item]) => {
    const { icon, iconDarkTheme, ...rest } = item as ItemObj
    return { ...rest, icon: isDarkTheme && typeof iconDarkTheme !== 'undefined' ? iconDarkTheme : icon }
  })

  return (
    <Select {...props} items={parsedItems} aria-label="Select network" label="">
      {(item) => {
        const { icon: Icon, chainId, label } = item as ItemObj
        return (
          <Item key={chainId} textValue={chainId.toString()}>
            {!hideIcon ? (
              <IconWrapper>
                <Icon aria-label={label} width="18" height="18" />
              </IconWrapper>
            ) : null}
            <strong>{label}</strong>
          </Item>
        )
      }}
    </Select>
  )
}

SelectNetwork.displayName = 'SelectNetwork'
SelectNetwork.defaultProps = {
  className: '',
}

const IconWrapper = styled.span`
  align-items: center;
  display: flex;
  margin-right: 0.25rem;
`

export default SelectNetwork
