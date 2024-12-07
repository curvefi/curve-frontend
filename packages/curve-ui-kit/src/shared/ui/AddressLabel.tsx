import { FunctionComponent } from 'react'
import Box from '@mui/material/Box'
import { addressShort } from 'curve-ui-kit/src/util'

export type Address = `0x${string}`

export type AddressLabelProps = {
  value: Address
}

export const AddressLabel: FunctionComponent<AddressLabelProps> = ({ value }) => (
  <Box maxWidth={200} title={value}>
    {addressShort(value)}
  </Box>
)
