import { FunctionComponent } from 'react'
import { Box } from './Box'

type Address = `0x${string}`

export type AddressLabelProps = {
  value: Address;
}

export const AddressLabel: FunctionComponent<AddressLabelProps> = ({value}) => (
  <Box maxWidth={200} title={value}>
    {value.substring(0, 7)}...{value.substring(38)}
  </Box>
)
