import { AddressActionInfo, type AddressDisplay } from '@evm-ui/shared/ui/AddressActionInfo'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import type { Address } from '@primitives/address.utils'
import type { Nullish } from '@primitives/objects.utils'
import { Badge } from '@ui/components/Badge'
import { SectionContentCard } from '@ui/components/SectionContentCard'
import { t } from '@ui/lib/i18n'

export type ContractsProps = {
  chainId: number
  poolAddress: Address
  lpTokenAddress: Address
  gaugeAddress: Address
  gaugeIsKilled: boolean | Nullish
  hasGauge: boolean
  oracles: { address: Address; title: string }[] | undefined
  addressDisplay: AddressDisplay
}

export const Contracts = ({
  chainId,
  poolAddress,
  lpTokenAddress,
  gaugeAddress,
  gaugeIsKilled,
  hasGauge,
  oracles,
  addressDisplay,
}: ContractsProps) => (
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

        {hasGauge && (
          <AddressActionInfo
            chainId={chainId}
            address={gaugeAddress}
            display={addressDisplay}
            title={
              <>
                {t`Gauge`} {gaugeIsKilled && <Badge disabled size="small" label={t`Inactive`} />}
              </>
            }
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
