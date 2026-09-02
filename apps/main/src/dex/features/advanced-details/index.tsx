import { isAddressEqual, zeroAddress, type Address } from 'viem'
import { AddGaugeLink } from '@/dex/components/PagePool/components/AddGaugeLink'
import { ManagePoolLink } from '@/dex/components/PagePool/components/ManagePoolLink'
import type { PageTransferProps } from '@/dex/components/PagePool/types'
import { useSwitch } from '@evm-ui/hooks/useSwitch'
import { t } from '@evm-ui/lib/i18n'
import { ViewMoreButton } from '@evm-ui/shared/ui/ViewMoreButton'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import type { QueryProp } from '@evm-ui/types/util'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Collapse from '@mui/material/Collapse'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { Contracts } from './components/Contracts'
import { Info } from './components/Info'
import { Parameters } from './components/Parameters'
import { Prices } from './components/Prices'

const { Spacing } = SizesAndSpaces

/** Two columns on desktop, one on mobile and desktop */
const GRID_SIZE = { mobile: 12, desktop: 6 } as const

type AdvancedDetailsProps = Pick<PageTransferProps, 'poolData' | 'routerParams'> & {
  poolQuery: QueryProp<PageTransferProps['poolDataCacheOrApi'] | undefined>
}

export const AdvancedDetails = ({ routerParams, poolQuery }: AdvancedDetailsProps) => {
  const { rChainId: chainId } = routerParams
  const poolDataCacheOrApi = poolQuery.data
  const { pool } = poolDataCacheOrApi ?? {}
  const gaugeAddress = pool?.gauge.address as Address | undefined

  const [isOpen, , , toggleOpen] = useSwitch(false)

  return (
    <Stack>
      <Card size="small">
        <CardHeader
          title={t`Advanced Details`}
          action={pool && <ManagePoolLink chainId={chainId} poolAddress={pool.address} />}
        />
        <CardContent
          component={Stack}
          /** All inner components use inline card headers which come with their own paddingBlock */
          sx={{ '&&': { paddingBlock: 0 } }}
        >
          <Grid container columnSpacing={Spacing.md}>
            <Grid size={GRID_SIZE}>
              <Stack>
                <Contracts chainId={chainId} poolQuery={poolQuery} />
                {poolDataCacheOrApi && gaugeAddress && pool && isAddressEqual(gaugeAddress, zeroAddress) && (
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
              <Info chainId={chainId} poolQuery={poolQuery} />
            </Grid>
          </Grid>

          <Collapse in={isOpen}>
            <Grid container columnSpacing={Spacing.md}>
              <Grid size={GRID_SIZE}>
                <Parameters chainId={chainId} poolQuery={poolQuery} />
              </Grid>

              <Grid size={GRID_SIZE}>
                <Prices chainId={chainId} poolQuery={poolQuery} />
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>

      <ViewMoreButton isOpen={isOpen} onClick={toggleOpen} />
    </Stack>
  )
}
