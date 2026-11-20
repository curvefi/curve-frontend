import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import type { Address } from '@primitives/address.utils'
import type { Nullish } from '@primitives/objects.utils'
import { GaugeStatusLabel } from '@ui/components/GaugeStatusLabel'
import { SectionContentCard } from '@ui/components/SectionContentCard'
import { AddressActionInfo, type AddressDisplay } from '@ui/features/forms/action-info/AddressActionInfo'
import type { QueryProp } from '@ui/features/queries/util'
import type { GaugeStatus } from '@ui/lib/gauge-status'
import { t } from '@ui/lib/i18n'

export type ContractsProps = {
  chainId: number
  poolAddress: Address
  lpTokenAddress: Address | Nullish
  /** Missing when the pool has no gauge */
  gauge?: { address: Address; status: QueryProp<GaugeStatus | null> }
  oracles?: { address: Address; title: string }[]
  addressDisplay: AddressDisplay
}

export const Contracts = ({ chainId, poolAddress, lpTokenAddress, gauge, oracles, addressDisplay }: ContractsProps) => (
  <Card size="extraSmall" variant="inline">
    <CardHeader title={t`Contracts`} />
    <CardContent>
      <SectionContentCard>
        {poolAddress && (
          <AddressActionInfo
            chainId={chainId}
            address={poolAddress}
            display={addressDisplay}
            title={poolAddress === lpTokenAddress ? t`Pool / Token` : t`Pool`}
          />
        )}

        {lpTokenAddress && poolAddress !== lpTokenAddress && (
          <AddressActionInfo chainId={chainId} address={lpTokenAddress} title={t`Token`} display={addressDisplay} />
        )}

        {gauge && (
          <AddressActionInfo
            chainId={chainId}
            address={gauge.address}
            display={addressDisplay}
            title={<GaugeStatusLabel label={t`Gauge`} status={gauge.status} testId="pool-contract-gauge-status" />}
          />
        )}
      </SectionContentCard>

      <SectionContentCard>
        {oracles?.map(oracle => (
          <AddressActionInfo key={oracle.address} chainId={chainId} {...oracle} display={addressDisplay} />
        ))}
      </SectionContentCard>
    </CardContent>
  </Card>
)
