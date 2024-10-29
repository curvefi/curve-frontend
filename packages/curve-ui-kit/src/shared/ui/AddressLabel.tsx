import { FunctionComponent } from 'react'
import { Box } from './Box'

export type Address = `0x${string}`

export type AddressLabelProps = {
  value: Address;
}

export const AddressLabel: FunctionComponent<AddressLabelProps> = ({value}) => (
  <Box maxWidth={200} title={value}>
    {value.substring(0, 6)}...{value.substring(38)}
  </Box>
)
