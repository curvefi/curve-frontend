import type { Address } from 'viem'
import { useReadContract } from 'wagmi'
import { refuelPoolAbi } from '@/dex/features/refuel/abi'
import { BorrowInformationContainer } from '@/dex/features/refuel/components/BorrowInformationContainer'
import { DailyRefuelsChart } from '@/dex/features/refuel/components/DailyRefuelsChart'
import { Header } from '@/dex/features/refuel/components/Header'
import { RecentRefuels } from '@/dex/features/refuel/components/recent-refuels'
import { RefuelPricesChart } from '@/dex/features/refuel/components/RefuelPricesChart'
import { RefuelSharesChart } from '@/dex/features/refuel/components/RefuelSharesChart'
import { ReservesCompositionChart } from '@/dex/features/refuel/components/ReservesCompositionChart'
import { useRefuelPool } from '@/dex/features/refuel/queries/pools.query'
import { RefuelFormTabs } from '@/dex/features/refuel/RefuelFormTabs'
import { useChainId } from '@/dex/hooks/useChainId'
import type { NetworkUrlParams } from '@/dex/types/main.types'
import type { Chain } from '@curvefi/prices-api'
import Grid from '@mui/material/Grid'
import { DEFAULT_DECIMALS } from '@primitives/objects.utils'
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { Banner } from '@ui-kit/shared/ui/Banner'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'

const { Spacing } = SizesAndSpaces

const LOW_RESERVES_RATIO = 1 / 10000

export const Refuel = () => {
  const { network, poolAddress } = useParams<NetworkUrlParams & { poolAddress: Address }>()
  const chainId = useChainId(network)
  const blockchainId = network as Chain

  const pool = useRefuelPool({ blockchainId, poolAddress })
  const refuelShares = useReadContract({
    address: poolAddress,
    abi: refuelPoolAbi,
    functionName: 'donation_shares',
    chainId,
  })

  // After consultation with Michael K, it was determined that the reserve ratio should be the ratio of available refuel shares to the total supply of LP tokens (as they're both represented in the same units)
  const reserveRatio =
    refuelShares.data == null || pool.data == null || pool.data.lpTokenSupply === 0
      ? undefined
      : Number(refuelShares.data) / 10 ** DEFAULT_DECIMALS / pool.data.lpTokenSupply

  return (
    poolAddress && (
      <DetailPageLayout
        header={<Header blockchainId={blockchainId} poolAddress={poolAddress} />}
        formTabs={<RefuelFormTabs chainId={chainId} blockchainId={blockchainId} poolAddress={poolAddress} />}
        testId="refuel-page"
      >
        <Grid container columnSpacing={Spacing.md}>
          {reserveRatio != null && reserveRatio < LOW_RESERVES_RATIO && (
            <Grid size={12}>
              <Banner
                subtitle={
                  t`Current reserve ratio: ` +
                  formatNumber(reserveRatio, { unit: 'percentage', decimals: 6, abbreviate: false }) +
                  t`. Refuel the pool to maintain balance`
                }
                severity="warning"
              >
                {t`Reserves low`}
              </Banner>
            </Grid>
          )}

          <Grid size={12}>
            <BorrowInformationContainer blockchainId={blockchainId} poolAddress={poolAddress} />
          </Grid>

          <Grid size={{ mobile: 12, tablet: 6 }}>
            <RefuelPricesChart blockchainId={blockchainId} poolAddress={poolAddress} />
          </Grid>

          <Grid size={{ mobile: 12, tablet: 6 }}>
            <RefuelSharesChart chainId={chainId} blockchainId={blockchainId} poolAddress={poolAddress} />
          </Grid>

          <Grid size={{ mobile: 12, tablet: 6 }}>
            <ReservesCompositionChart blockchainId={blockchainId} poolAddress={poolAddress} />
          </Grid>

          <Grid size={{ mobile: 12, tablet: 6 }}>
            <DailyRefuelsChart blockchainId={blockchainId} poolAddress={poolAddress} />
          </Grid>

          <Grid size={12}>
            <RecentRefuels chainId={chainId} blockchainId={blockchainId} poolAddress={poolAddress} />
          </Grid>
        </Grid>
      </DetailPageLayout>
    )
  )
}
