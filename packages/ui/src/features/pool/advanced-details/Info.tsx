import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import type { Address } from '@primitives/address.utils'
import { maybe, notFalsy, type Nullish } from '@primitives/objects.utils'
import { SectionContentCard } from '@ui/components/SectionContentCard'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { AddressActionInfo, type AddressDisplay } from '@ui/features/forms/action-info/AddressActionInfo'
import { fakeLoadingQ } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

export type InfoProps = {
  chainId: number
  poolId?: string
  poolType: string | Nullish
  isMetapool?: boolean
  isBasePool?: boolean
  basePoolAddress?: Address
  registryAddress?: Address
  vyperVersion?: string | null
  addressDisplay: AddressDisplay
}

export const Info = ({
  chainId,
  poolType,
  isMetapool,
  isBasePool,
  basePoolAddress,
  registryAddress,
  vyperVersion,
  addressDisplay,
  ...props
}: InfoProps) => (
  <Card size="extraSmall" variant="inline">
    <CardHeader title={t`Info`} />
    <CardContent component={SectionContentCard}>
      <ActionInfo
        label={t`Pool type`}
        value={notFalsy(poolType ?? '-', isMetapool && t`Metapool`, isBasePool && t`Basepool`).join(', ')}
      />

      {maybe(basePoolAddress, address => (
        <AddressActionInfo chainId={chainId} title={t`Basepool`} address={address} display={addressDisplay} />
      ))}

      {maybe(vyperVersion, x => (
        <ActionInfo label={t`Vyper version`} value={x} />
      ))}

      {maybe(registryAddress, address => (
        <AddressActionInfo chainId={chainId} title={t`Registry`} address={address} display={addressDisplay} />
      ))}
      {'poolId' in props && <ActionInfo label={t`ID`} value={fakeLoadingQ(props.poolId)} />}
    </CardContent>
  </Card>
)
