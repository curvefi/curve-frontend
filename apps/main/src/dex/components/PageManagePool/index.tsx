import { useReadContract } from 'wagmi'
import { refuelPoolAbi } from '@/dex/features/manage-pool/abi'
import { BorrowInformationContainer } from '@/dex/features/manage-pool/components/BorrowInformationContainer'
import { DailyRefuelsChart } from '@/dex/features/manage-pool/components/DailyRefuelsChart'
import { RecentRefuels } from '@/dex/features/manage-pool/components/recent-refuels'
import { RefuelPricesChart } from '@/dex/features/manage-pool/components/RefuelPricesChart'
import { RefuelSharesChart } from '@/dex/features/manage-pool/components/RefuelSharesChart'
import { ReservesCompositionChart } from '@/dex/features/manage-pool/components/ReservesCompositionChart'
import { useRefuelPool } from '@/dex/features/manage-pool/queries/pools.query'
import { RefuelFormTabs } from '@/dex/features/manage-pool/RefuelFormTabs'
import { useChainId } from '@/dex/hooks/useChainId'
import type { PoolAddressParams } from '@/dex/types/main.types'
import { PoolPageHeader } from '@/dex/widgets/page-header'
import type { Chain } from '@curvefi/prices-api'
import Grid from '@mui/material/Grid'
import { DEFAULT_DECIMALS } from '@primitives/objects.utils'
import { useParams } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'
import { DEX_ROUTES, getInternalUrl } from '@ui-kit/shared/routes'
import { Banner } from '@ui-kit/shared/ui/Banner'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { formatNumber } from '@ui-kit/utils'
import { DetailPageLayout } from '@ui-kit/widgets/DetailPageLayout/DetailPageLayout'

const { Spacing } = SizesAndSpaces

const LOW_RESERVES_RATIO = 1 / 10000

export const ManagePool = () => {
  const { network, poolAddress } = useParams<PoolAddressParams>()
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
        header={
          <PoolPageHeader
            chainId={chainId}
            blockchainId={blockchainId}
            poolIdOrAddress={poolAddress}
            backHref={getInternalUrl('dex', blockchainId, `${DEX_ROUTES.PAGE_POOLS}/${poolAddress}`)}
          />
        }
        formTabs={{
          content: <RefuelFormTabs chainId={chainId} blockchainId={blockchainId} poolAddress={poolAddress} />,
        }}
        testId="refuel-page"
      >
        <Grid container columnSpacing={Spacing.md}>
          {reserveRatio != null && reserveRatio < LOW_RESERVES_RATIO && (
            <Grid size={12}>
              <Banner
                subtitle={
                  t`Current reserve ratio: ` +
                  formatNumber(reserveRatio * 100, { unit: 'percentage', decimals: 6, abbreviate: false }) +
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

          <Grid size={{ mobile: 12, desktop: 6 }}>
            <RefuelPricesChart blockchainId={blockchainId} poolAddress={poolAddress} />
          </Grid>

          <Grid size={{ mobile: 12, desktop: 6 }}>
            <RefuelSharesChart chainId={chainId} blockchainId={blockchainId} poolAddress={poolAddress} />
          </Grid>

          <Grid size={{ mobile: 12, desktop: 6 }}>
            <ReservesCompositionChart blockchainId={blockchainId} poolAddress={poolAddress} />
          </Grid>

          <Grid size={{ mobile: 12, desktop: 6 }}>
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
