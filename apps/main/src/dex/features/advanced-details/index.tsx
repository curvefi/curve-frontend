import type { ReactNode } from 'react'
import { type AddressDisplay } from '@evm-ui/shared/ui/AddressActionInfo'
import { ViewMoreButton } from '@evm-ui/shared/ui/ViewMoreButton'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Collapse from '@mui/material/Collapse'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import type { Address } from '@primitives/address.utils'
import type { Nullish } from '@primitives/objects.utils'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useSwitch } from '@ui/hooks/useSwitch'
import { t } from '@ui/lib/i18n'
import { Contracts } from './components/Contracts'
import { Info } from './components/Info'
import { Parameters } from './components/Parameters'
import { Prices } from './components/Prices'

const { Spacing } = SizesAndSpaces

/** Two columns on desktop, one on mobile and desktop */
const GRID_SIZE = { mobile: 12, desktop: 6 } as const

export const AdvancedDetails = ({
  chainId,
  poolId,
  info,
  contracts,
  addressDisplay,
  managePoolLink,
  addGaugeLink,
}: {
  chainId: number
  poolId: string
  info: {
    poolType: string | Nullish
    isMetapool: boolean
    isBasePool: boolean
    basePoolAddress: Address | undefined
    registryAddress: Address | undefined
    vyperVersion: string | undefined
  }
  contracts: {
    poolAddress: Address
    lpTokenAddress: Address
    gaugeAddress: Address
    hasGauge: boolean
    gaugeIsKilled: boolean
    oracles: { address: Address; title: string }[]
  }
  addressDisplay: AddressDisplay
  managePoolLink: ReactNode
  addGaugeLink: ReactNode
}) => {
  const [isOpen, , , toggleOpen] = useSwitch(false)

  return (
    <Stack>
      <Card size="small">
        <CardHeader title={t`Advanced Details`} action={managePoolLink} />
        <CardContent>
          <Grid container columnSpacing={Spacing.md}>
            <Grid size={GRID_SIZE}>
              <Stack>
                <Contracts chainId={chainId} {...contracts} addressDisplay={addressDisplay} />
                {!contracts.hasGauge && addGaugeLink}
              </Stack>
            </Grid>

            <Grid size={GRID_SIZE}>
              <Info chainId={chainId} poolId={poolId} {...info} addressDisplay={addressDisplay} />
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
