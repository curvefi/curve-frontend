import { AddressActionInfo } from '@evm-ui/shared/ui/AddressActionInfo'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import type { Address } from '@primitives/address.utils'
import { type Nullish, maybe, notFalsy } from '@primitives/objects.utils'
import { ActionInfo } from '@ui/features/forms/action-info/ActionInfo'
import { fakeLoadingQ } from '@ui/features/queries/util'
import { t } from '@ui/lib/i18n'
import { Section } from './Section'

export const Info = ({
  chainId,
  poolId,
  poolType,
  isMetapool,
  isBasePool,
  basePoolAddress,
  registryAddress,
  vyperVersion,
  formatAddress,
  scanAddressPath,
}: {
  chainId: number
  poolId: string
  poolType: string | Nullish
  isMetapool: boolean
  isBasePool: boolean
  basePoolAddress: Address | undefined
  registryAddress: Address | undefined
  vyperVersion: string | undefined
  formatAddress: (address: Address) => string
  scanAddressPath: (chainId: number, address: Address) => string | undefined
}) => (
  <Card size="extraSmall" variant="inline">
    <CardHeader title={t`Info`} />
    <CardContent component={Section}>
      <ActionInfo
        label={t`Pool type`}
        value={notFalsy(poolType ?? '-', isMetapool && t`Metapool`, isBasePool && t`Basepool`).join(', ')}
      />

      {maybe(basePoolAddress, address => (
        <AddressActionInfo
          chainId={chainId}
          title={t`Basepool`}
          address={address}
          formatAddress={formatAddress}
          scanAddressPath={scanAddressPath}
        />
      ))}

      {maybe(vyperVersion, x => (
        <ActionInfo label={t`Vyper version`} value={x} />
      ))}

      {maybe(registryAddress, address => (
        <AddressActionInfo
          chainId={chainId}
          title={t`Registry`}
          address={address}
          formatAddress={formatAddress}
          scanAddressPath={scanAddressPath}
        />
      ))}
      <ActionInfo label={t`ID`} value={fakeLoadingQ(poolId)} />
    </CardContent>
  </Card>
)
