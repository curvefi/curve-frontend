import { ReactNode } from 'react'
import { t } from '@evm-ui/lib/i18n'
import type { TypographyVariantKey } from '@evm-ui/themes/typography'
import { scanAddressPath } from '@legacy-ui/utils'
import { Typography } from '@mui/material'
import { maybe } from '@primitives/objects.utils'
import { shortenAddress } from '../../utils'
import { ActionInfo, type ActionInfoProps } from './ActionInfo'
import { ExternalLink } from './ExternalLink'

type AddressActionInfoProps = {
  chainId: number
  title: ReactNode
  labelTooltip?: ActionInfoProps['labelTooltip']
  size?: ActionInfoProps['size']
  address: string | undefined
  isBorderBottom?: boolean
  hideTooltip?: boolean
  testId?: string
}

const VALUE_SIZE = {
  small: 'bodyXsBold',
  medium: 'bodyMBold',
} satisfies Record<NonNullable<AddressActionInfoProps['size']>, TypographyVariantKey>

export const AddressActionInfo = ({
  chainId,
  title,
  labelTooltip,
  size = 'medium',
  address,
  isBorderBottom,
  hideTooltip = false,
  testId,
}: AddressActionInfoProps) => (
  <ActionInfo
    testId={testId}
    label={title}
    labelTooltip={labelTooltip}
    size={size}
    value={
      /** TODO: Clarify: The design has this typography component as as semi-bold,
       * should Bold typography variants have an updated font-weight? 🤔 */
      <Typography variant={VALUE_SIZE[size]}>{shortenAddress(address)}</Typography>
    }
    copyValue={address}
    valueTooltip={
      !hideTooltip &&
      maybe(address && scanAddressPath(chainId, address), link => (
        <ExternalLink href={link} label={t`View on explorer`} />
      ))
    }
    sx={{
      alignItems: 'center',
      ...(isBorderBottom && {
        borderBottom: t => `1px solid ${t.palette.divider}`,
      }),
    }}
  />
)
