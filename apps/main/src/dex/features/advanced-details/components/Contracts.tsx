import { isAddressEqual, zeroAddress, type Address } from 'viem'
import { ChipInactive } from '@/dex/components/ChipInactive'
import { useNetworkByChain } from '@/dex/entities/networks'
import type { ChainId, PoolDataCacheOrApi } from '@/dex/types/main.types'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import { AddressActionInfo } from '@ui-kit/shared/ui/AddressActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const Contracts = ({
  chainId,
  poolDataCacheOrApi,
}: {
  chainId: ChainId
  poolDataCacheOrApi: PoolDataCacheOrApi
}) => {
  const { data: network } = useNetworkByChain({ chainId })

  const poolAddress = poolDataCacheOrApi.pool.address as Address
  const lpTokenAddress = poolDataCacheOrApi.pool.lpToken as Address
  const gaugeAddress = poolDataCacheOrApi.pool.gauge.address as Address
  const gaugeIsKilled = !!poolDataCacheOrApi.gauge.isKilled
  const isSameAddress = isAddressEqual(poolAddress, lpTokenAddress)

  return (
    <Card size="inline">
      <CardHeader title={t`Contracts`} />
      <CardContent component={Stack} sx={{ marginBlock: Spacing.sm }}>
        {poolAddress && (
          <AddressActionInfo
            network={network}
            address={poolAddress}
            title={isSameAddress ? t`Pool / Token` : t`Pool`}
          />
        )}

        {!isSameAddress && lpTokenAddress && (
          <AddressActionInfo network={network} address={lpTokenAddress} title={t`Token`} />
        )}

        {!isAddressEqual(gaugeAddress, zeroAddress) && (
          <AddressActionInfo
            network={network}
            address={gaugeAddress}
            title={
              <>
                {t`Gauge`} {gaugeIsKilled && <ChipInactive>Inactive</ChipInactive>}
              </>
            }
          />
        )}
      </CardContent>
    </Card>
  )
}
