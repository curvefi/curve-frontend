import { isAddressEqual, zeroAddress, type Address } from 'viem'
import { AddGaugeLink } from '@/dex/components/PagePool/components/AddGaugeLink'
import { ManagePoolLink } from '@/dex/components/PagePool/components/ManagePoolLink'
import type { PageTransferProps } from '@/dex/components/PagePool/types'
import { usePoolIdByAddressOrId } from '@/dex/hooks/usePoolIdByAddressOrId'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Collapse from '@mui/material/Collapse'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { useSwitch } from '@ui-kit/hooks/useSwitch'
import { t } from '@ui-kit/lib/i18n'
import { ViewMoreButton } from '@ui-kit/shared/ui/ViewMoreButton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Contracts } from './components/Contracts'
import { Info } from './components/Info'
import { Parameters } from './components/Parameters'
import { Prices } from './components/Prices'

const { Spacing } = SizesAndSpaces

/** Two columns on desktop, one on mobile and desktop */
const GRID_SIZE = { mobile: 12, desktop: 6 } as const

type AdvancedDetailsProps = Pick<PageTransferProps, 'poolData' | 'poolDataCacheOrApi' | 'routerParams'>

export const AdvancedDetails = ({ routerParams, poolDataCacheOrApi }: AdvancedDetailsProps) => {
  const { rChainId: chainId, rPoolIdOrAddress: poolIdOrAddress } = routerParams
  const poolId = usePoolIdByAddressOrId({ chainId, poolIdOrAddress })
  const resolvedPoolId = poolId ?? poolDataCacheOrApi.pool.id
  const { pool } = poolDataCacheOrApi
  const gaugeAddress = pool.gauge.address as Address

  const [isOpen, , , toggleOpen] = useSwitch(false)

  return (
    <Stack>
      <Card size="small">
        <CardHeader
          title={t`Advanced Details`}
          action={<ManagePoolLink chainId={chainId} poolAddress={pool.address} />}
        />
        <CardContent
          component={Stack}
          /** All inner components use inline card headers which come with their own paddingBlock */
          sx={{ '&&': { paddingBlock: 0 } }}
        >
          <Grid container columnSpacing={Spacing.md}>
            <Grid size={GRID_SIZE}>
              <Stack>
                <Contracts chainId={chainId} poolDataCacheOrApi={poolDataCacheOrApi} />
                {isAddressEqual(gaugeAddress, zeroAddress) && (
                  <AddGaugeLink
                    poolDataCacheOrApi={poolDataCacheOrApi}
                    chainId={chainId}
                    address={pool.address}
                    lpToken={pool.lpToken}
                  />
                )}
              </Stack>
            </Grid>

            <Grid size={GRID_SIZE}>
              <Info chainId={chainId} poolId={resolvedPoolId} poolDataCacheOrApi={poolDataCacheOrApi} />
            </Grid>
          </Grid>

          <Collapse in={isOpen}>
            <Grid container columnSpacing={Spacing.md}>
              <Grid size={GRID_SIZE}>
                <Parameters chainId={chainId} poolId={resolvedPoolId} poolDataCacheOrApi={poolDataCacheOrApi} />
              </Grid>

              <Grid size={GRID_SIZE}>
                <Prices chainId={chainId} poolId={resolvedPoolId} poolDataCacheOrApi={poolDataCacheOrApi} />
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>

      <ViewMoreButton isOpen={isOpen} onClick={toggleOpen} />
    </Stack>
  )
}
