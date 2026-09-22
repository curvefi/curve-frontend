import { AddressActionInfo, type AddressDisplay } from '@evm-ui/shared/ui/AddressActionInfo'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import type { Address } from '@primitives/address.utils'
import { maybe, notFalsy, type Nullish } from '@primitives/objects.utils'
import { SectionContentCard } from '@ui/components/SectionContentCard'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { fakeLoadingQ } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'

export const Info = ({
  chainId,
  poolId,
  poolType,
  isMetapool,
  isBasePool,
  basePoolAddress,
  registryAddress,
  vyperVersion,
  addressDisplay,
}: {
  chainId: number
  poolId: string
  poolType: string | Nullish
  isMetapool: boolean
  isBasePool: boolean
  basePoolAddress: Address | undefined
  registryAddress: Address | undefined
  vyperVersion: string | undefined
  addressDisplay: AddressDisplay
}) => (
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
      <ActionInfo label={t`ID`} value={fakeLoadingQ(poolId)} />
    </CardContent>
  </Card>
)
