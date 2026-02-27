import { ReactNode } from 'react'
import { Typography } from '@mui/material'
import { BaseConfig, scanAddressPath } from '@ui/utils'
import { shortenAddress } from '../../utils'
import { ActionInfo } from './ActionInfo'

export interface AddressActionInfoProps {
  network: BaseConfig | undefined
  title: ReactNode
  address: string | undefined
  isBorderBottom?: boolean
}

export const AddressActionInfo = ({ network, title, address, isBorderBottom }: AddressActionInfoProps) => (
  <ActionInfo
    label={title}
    value={
      /** TODO: Clarify: The design has this typography component as as semi-bold,
       * should Bold typography variants have an updated font-weight? 🤔 */
      <Typography variant="bodyMBold">{shortenAddress(address)}</Typography>
    }
    copyValue={address}
    sx={{
      alignItems: 'center',
      ...(isBorderBottom && {
        borderBottom: (t) => `1px solid ${t.palette.divider}`,
      }),
    }}
    link={network && address ? scanAddressPath(network, address) : undefined}
  />
)
