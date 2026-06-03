import { useEffect } from 'react'
import { isAddressEqual, zeroAddress, type Address } from 'viem'
import { AddGaugeLink } from '@/dex/components/PagePool/components/AddGaugeLink'
import type { PageTransferProps } from '@/dex/components/PagePool/types'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import { useTokenAlert } from '@/dex/hooks/useTokenAlert'
import { useStore } from '@/dex/store/useStore'
import type { PoolAlert } from '@/dex/types/main.types'
import type { Pool as PricesApiPool } from '@curvefi/prices-api/pools'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { Link as TanstackLink } from '@tanstack/react-router'
import { t } from '@ui-kit/lib/i18n'
import { cardContentSmallStyles } from '@ui-kit/themes/components/card-content'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Alerts } from './components/Alerts'
import { Contracts } from './components/Contracts'
import { MarketComposition } from './components/market-composition'
import { Metrics } from './components/Metrics'
import { Parameters } from './components/Parameters'
import { YieldBreakdown } from './components/yield-breakdown'

const { Spacing } = SizesAndSpaces

type AdvancedDetailsProps = {
  poolAlert: PoolAlert | null
  pricesApiPoolData?: PricesApiPool
  managePoolPath?: string
} & Pick<PageTransferProps, 'curve' | 'poolData' | 'poolDataCacheOrApi' | 'routerParams'>

export const AdvancedDetails = ({
  curve,
  routerParams,
  poolData,
  poolDataCacheOrApi,
  poolAlert,
  pricesApiPoolData,
  managePoolPath,
}: AdvancedDetailsProps) => {
  const { rChainId: chainId, rPoolIdOrAddress: poolIdOrAddress } = routerParams
  const poolId = usePoolIdByAddressOrId({ chainId, poolIdOrAddress })
  const resolvedPoolId = poolId ?? poolDataCacheOrApi.pool.id
  const { pool } = poolDataCacheOrApi
  const gaugeAddress = pool.gauge.address as Address
  const fetchPoolStats = useStore(state => state.pools.fetchPoolStats)
  const tokenAlert = useTokenAlert(poolData?.tokenAddressesAll ?? poolDataCacheOrApi.tokenAddressesAll)

  // Preserve the legacy stats fetch path; forms still rely on these store-backed values.
  useEffect(() => {
    if (curve && poolData) {
      void fetchPoolStats(curve, poolData)
    }
  }, [curve, fetchPoolStats, poolData])

  return (
    <Card>
      <CardHeader
        size="small"
        title={t`Advanced Details`}
        action={
          managePoolPath && (
            <Button
              component={TanstackLink}
              to={managePoolPath}
              variant="inline"
              color="ghost"
              sx={{ whiteSpace: 'nowrap' }}
            >
              {t`Manage pool`}
            </Button>
          )
        }
      />
      <CardContent
        size="inline"
        component={Grid}
        container
        columnSpacing={Spacing.md}
        rowSpacing={Spacing.md}
        sx={{ '&&': { backgroundColor: t => t.design.Layer[1].Fill } }}
      >
        <Grid size={{ mobile: 12, desktop: 8 }} sx={cardContentSmallStyles}>
          <Stack>
            <Metrics
              chainId={chainId}
              poolDataCacheOrApi={poolDataCacheOrApi}
              poolId={resolvedPoolId}
              pricesApiPoolData={pricesApiPoolData}
            />
            <YieldBreakdown chainId={chainId} poolDataCacheOrApi={poolDataCacheOrApi} poolId={resolvedPoolId} />
            <MarketComposition
              chainId={chainId}
              poolDataCacheOrApi={poolDataCacheOrApi}
              poolId={resolvedPoolId}
              pricesApiPoolData={pricesApiPoolData}
            />
            <Alerts
              isCryptoPool={pool.referenceAsset === 'CRYPTO'}
              poolAlert={poolAlert}
              poolName={pool.name}
              tokenAlert={tokenAlert}
            />
          </Stack>
        </Grid>

        <Grid size={{ mobile: 12, desktop: 4 }} sx={{ display: 'flex' }}>
          <Stack
            sx={{
              backgroundColor: theme => theme.design.Layer[2].Fill,
              border: theme => `1px solid ${theme.design.Layer[2].Outline}`,
              flexGrow: 1,
              paddingInline: Spacing.sm,
            }}
          >
            <Contracts chainId={chainId} poolDataCacheOrApi={poolDataCacheOrApi} />

            {isAddressEqual(gaugeAddress, zeroAddress) && (
              <AddGaugeLink
                poolDataCacheOrApi={poolDataCacheOrApi}
                chainId={chainId}
                address={pool.address}
                lpToken={pool.lpToken}
              />
            )}

            <Parameters chainId={chainId} poolId={resolvedPoolId} poolDataCacheOrApi={poolDataCacheOrApi} />
          </Stack>
        </Grid>
      </CardContent>
    </Card>
  )
}
