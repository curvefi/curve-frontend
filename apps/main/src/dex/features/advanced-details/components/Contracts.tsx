import { ChipInactive } from '@/dex/components/ChipInactive'
import { AddressActionInfo } from '@evm-ui/shared/ui/AddressActionInfo'
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
  formatAddress,
  scanAddressPath,
}: {
  chainId: number
  poolAddress: Address
  lpTokenAddress: Address
  gaugeAddress: Address
  gaugeIsKilled: boolean
  hasGauge: boolean
  oracles: { address: Address; title: string }[]
  formatAddress: (address: Address) => string
  scanAddressPath: (chainId: number, address: Address) => string | undefined
}) => (
  <Card size="extraSmall" variant="inline">
    <CardHeader title={t`Contracts`} />
    <CardContent component={Stack}>
      <Section>
        {poolAddress && (
          <AddressActionInfo
            chainId={chainId}
            address={poolAddress}
            formatAddress={formatAddress}
            scanAddressPath={scanAddressPath}
            title={poolAddress === lpTokenAddress ? t`Pool / Token` : t`Pool`}
          />
        )}

        {lpTokenAddress && poolAddress !== lpTokenAddress && (
          <AddressActionInfo
            chainId={chainId}
            address={lpTokenAddress}
            title={t`Token`}
            formatAddress={formatAddress}
            scanAddressPath={scanAddressPath}
          />
        )}

        {hasGauge && (
          <AddressActionInfo
            chainId={chainId}
            address={gaugeAddress}
            formatAddress={formatAddress}
            scanAddressPath={scanAddressPath}
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
          <AddressActionInfo
            key={oracle.address}
            chainId={chainId}
            {...oracle}
            formatAddress={formatAddress}
            scanAddressPath={scanAddressPath}
          />
        ))}
      </Section>
    </CardContent>
  </Card>
)
