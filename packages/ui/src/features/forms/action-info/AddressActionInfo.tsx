import { ReactNode } from 'react'
import { Typography } from '@mui/material'
import type { Address } from '@primitives/address.utils'
import { UNAVAILABLE_NOTATION } from '@primitives/number.utils'
import { maybe } from '@primitives/objects.utils'
import { ExternalLink } from '@ui/components/ExternalLink'
import { ActionInfo, type ActionInfoProps } from '@ui/features/forms/action-info/ActionInfo'
import type { TypographyVariantKey } from '@ui/features/themes/typography'
import { t } from '@ui/lib/i18n'

/** Addresses are normalized by the caller; this only controls their presentation. */
export type AddressDisplay = {
  formatAddress: (address: Address) => string
  scanAddressPath: (chainId: number, address: Address) => string | undefined
}

export type AddressActionInfoProps = {
  chainId: number
  title: ReactNode
  labelTooltip?: ActionInfoProps['labelTooltip']
  size?: ActionInfoProps['size']
  address: Address | undefined
  display: AddressDisplay
  isBorderBottom?: boolean
  hideTooltip?: boolean
  testId?: string
}

const VALUE_SIZE = { small: 'bodyXsBold', medium: 'bodyMBold' } satisfies Record<
  NonNullable<AddressActionInfoProps['size']>,
  TypographyVariantKey
>

export const AddressActionInfo = ({
  chainId,
  title,
  labelTooltip,
  size = 'medium',
  address,
  display: { formatAddress, scanAddressPath },
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
      <Typography variant={VALUE_SIZE[size]}>{maybe(address, formatAddress) ?? UNAVAILABLE_NOTATION}</Typography>
    }
    copyValue={address}
    valueTooltip={
      !hideTooltip &&
      maybe(address && scanAddressPath(chainId, address), link => (
        <ExternalLink href={link} label={t`View on explorer`} />
      ))
    }
    sx={{ alignItems: 'center', ...(isBorderBottom && { borderBottom: t => `1px solid ${t.palette.divider}` }) }}
  />
)
