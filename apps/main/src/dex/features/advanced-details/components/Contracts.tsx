import { ChipInactive } from '@/dex/components/ChipInactive'
import { AddressActionInfo, type AddressDisplay } from '@evm-ui/shared/ui/AddressActionInfo'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import { t } from '@ui/lib/i18n'
import { Section } from './Section'

export const Contracts = ({
  chainId,
  poolAddress,
  lpTokenAddress,
  gaugeAddress,
  gaugeIsKilled,
  hasGauge,
  oracles,
  addressDisplay,
}: {
  chainId: number
  poolAddress: Address
  lpTokenAddress: Address
  gaugeAddress: Address
  gaugeIsKilled: boolean
  hasGauge: boolean
  oracles: { address: Address; title: string }[]
  addressDisplay: AddressDisplay
}) => (
  <Card size="extraSmall" variant="inline">
    <CardHeader title={t`Contracts`} />
    <CardContent component={Stack}>
      <Section>
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
                {t`Gauge`} {gaugeIsKilled && <ChipInactive>Inactive</ChipInactive>}
              </>
            }
          />
        )}
      </Section>

      <Section>
        {oracles.map(oracle => (
          <AddressActionInfo key={oracle.address} chainId={chainId} {...oracle} display={addressDisplay} />
        ))}
      </Section>
    </CardContent>
  </Card>
)
