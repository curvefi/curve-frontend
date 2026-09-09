import { isAddressEqual, zeroAddress, type Address } from 'viem'
import { AddGaugeLink } from '@/dex/components/PagePool/components/AddGaugeLink'
import { ManagePoolLink } from '@/dex/components/PagePool/components/ManagePoolLink'
import { ViewMoreButton } from '@evm-ui/shared/ui/ViewMoreButton'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Collapse from '@mui/material/Collapse'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useSwitch } from '@ui/hooks/useSwitch'
import { t } from '@ui/lib/i18n'
import { usePoolContext } from '../pool-context'
import { Contracts } from './components/Contracts'
import { Info } from './components/Info'
import { Parameters } from './components/Parameters'
import { Prices } from './components/Prices'

const { Spacing } = SizesAndSpaces

/** Two columns on desktop, one on mobile and desktop */
const GRID_SIZE = { mobile: 12, desktop: 6 } as const

export const AdvancedDetails = () => {
  const {
    chainId,
    poolData: { pool },
  } = usePoolContext()
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
                <Contracts />
                {isAddressEqual(gaugeAddress, zeroAddress) && <AddGaugeLink />}
              </Stack>
            </Grid>

            <Grid size={GRID_SIZE}>
              <Info />
            </Grid>
          </Grid>

          <Collapse in={isOpen}>
            <Grid container columnSpacing={Spacing.md}>
              <Grid size={GRID_SIZE}>
                <Parameters />
              </Grid>

              <Grid size={GRID_SIZE}>
                <Prices />
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>

      <ViewMoreButton isOpen={isOpen} onClick={toggleOpen} />
    </Stack>
  )
}
