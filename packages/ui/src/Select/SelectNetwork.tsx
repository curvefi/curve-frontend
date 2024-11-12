import type { ConnectState } from 'ui/src/utils'
import type { SelectProps } from 'ui/src/Select/Select'

import * as React from 'react'
import Image from 'next/image'
import { Item } from 'react-stately'
import styled from 'styled-components'

import Select from 'ui/src/Select'

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

export const SelectNetwork: React.FC<SelectNetworkProps> = ({
  className = '',
  connectState,
  hideIcon,
  isDarkTheme,
  items,
  ...props
}) => {
  // todo: defaultSrc should be used when the image is not found, but it's not working yet
  const handleOnError = (evt: React.SyntheticEvent<HTMLImageElement, Event>, defaultSrc: string) => {
    ;(evt.target as HTMLImageElement).src = defaultSrc
  }

  return (
    <Select {...props} className={className} items={items} aria-label="Select network" label="">
      {({ chainId, src, srcDark, label }) => {
        return (
          <Item key={chainId} textValue={chainId.toString()}>
            {!hideIcon && (
              <IconWrapper>
                <Image
                  alt={label}
                  // onError={(evt) => setTimeout(() => handleOnError(evt, src), 0)}
                  src={isDarkTheme ? srcDark : src}
                  loading="lazy"
                  width="18"
                  height="18"
                />
              </IconWrapper>
            )}
            <strong>{label}</strong>
          </Item>
        )
      }}
    </Select>
  )
}

SelectNetwork.displayName = 'SelectNetwork'
const IconWrapper = styled.span`
  align-items: center;
  display: flex;
  margin-right: 0.25rem;
`

export default SelectNetwork
