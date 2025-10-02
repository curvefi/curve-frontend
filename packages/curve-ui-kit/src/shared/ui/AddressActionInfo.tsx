import { ReactNode } from 'react'
import Button from '@mui/material/Button'
import LinkMui from '@mui/material/Link'
import { BaseConfig } from '@ui/utils'
import { shortenAddress } from '../../utils'
import { ArrowTopRightIcon } from '../icons/ArrowTopRightIcon'
import ActionInfo from './ActionInfo'

export interface AddressActionInfoProps {
  network: BaseConfig | undefined
  title: ReactNode
  address: string | undefined
  isBorderBottom: boolean
}

export const AddressActionInfo = ({ network, title, address, isBorderBottom }: AddressActionInfoProps) => (
  <ActionInfo
    label={title}
    value={
      address && (
        <Button
          component={LinkMui}
          href={network?.scanAddressPath(address)}
          target="_blank"
          color="navigation"
          variant="link"
          endIcon={<ArrowTopRightIcon />}
          size="extraSmall"
        >
          {shortenAddress(address)}
        </Button>
      )
    }
    copyValue={address}
    {...(isBorderBottom && { sx: { borderBottom: (t) => `1px solid ${t.palette.divider}` } })}
  />
)
