import { ReactNode } from 'react'
import { Typography } from '@mui/material'
import { maybe } from '@primitives/objects.utils'
import { BaseConfig, scanAddressPath } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'
import { shortenAddress } from '../../utils'
import { ActionInfo, type ActionInfoProps } from './ActionInfo'
import { ExternalLink } from './ExternalLink'

type AddressActionInfoProps = {
  network: BaseConfig | undefined
  title: ReactNode
  labelTooltip?: ActionInfoProps['labelTooltip']
  address: string | undefined
  isBorderBottom?: boolean
}

export const AddressActionInfo = ({
  network,
  title,
  labelTooltip,
  address,
  isBorderBottom,
}: AddressActionInfoProps) => (
  <ActionInfo
    label={title}
    labelTooltip={labelTooltip}
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
