import { ReactNode } from 'react'
import { t } from '@evm-ui/lib/i18n'
import { BaseConfig, scanAddressPath } from '@legacy-ui/utils'
import { Typography } from '@mui/material'
import { maybe } from '@primitives/objects.utils'
import { shortenAddress } from '../../utils'
import { ActionInfo, type ActionInfoProps } from './ActionInfo'
import { ExternalLink } from './ExternalLink'

type AddressActionInfoProps = {
  network: BaseConfig | undefined
  title: ReactNode
  labelTooltip?: ActionInfoProps['labelTooltip']
  address: string | undefined
  isBorderBottom?: boolean
  testId?: string
}

export const AddressActionInfo = ({
  network,
  title,
  labelTooltip,
  address,
  isBorderBottom,
  testId,
}: AddressActionInfoProps) => (
  <ActionInfo
    testId={testId}
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
