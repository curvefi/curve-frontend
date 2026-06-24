import { ReactNode } from 'react'
import { Typography } from '@mui/material'
import { maybe } from '@primitives/objects.utils'
import { BaseConfig, scanAddressPath } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { shortenAddress } from '../../utils'
import { ActionInfo } from './ActionInfo'
import { ExternalLink } from './ExternalLink'

type AddressActionInfoProps = {
  network: BaseConfig | undefined
  title: ReactNode
  address: string | undefined
  isBorderBottom?: boolean
  testId?: string
}

export const AddressActionInfo = ({ network, title, address, isBorderBottom, testId }: AddressActionInfoProps) => (
  <ActionInfo
    testId={testId}
    label={title}
    value={
      /** TODO: Clarify: The design has this typography component as as semi-bold,
       * should Bold typography variants have an updated font-weight? 🤔 */
      <Typography variant="bodyMBold">{shortenAddress(address)}</Typography>
    }
    copyValue={address}
    valueTooltip={maybe(address && scanAddressPath(network, address), link => (
      <ExternalLink href={link} label={t`View on explorer`} />
    ))}
    sx={{
      alignItems: 'center',
      ...(isBorderBottom && {
        borderBottom: t => `1px solid ${t.palette.divider}`,
      }),
    }}
  />
)
