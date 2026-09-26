import type { ReactNode } from 'react'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Collapse from '@mui/material/Collapse'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import { type AddressDisplay } from '@ui/features/forms/action-info/AddressActionInfo'
import { ViewMoreButton } from '@ui/features/pool/advanced-details/ViewMoreButton'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { useSwitch } from '@ui/hooks/useSwitch'
import { t } from '@ui/lib/i18n'
import { Contracts, type ContractsProps } from './Contracts'
import { Info, type InfoProps } from './Info'
import { Parameters, type ParametersProps } from './Parameters'
import { Prices, type PricesProps } from './Prices'

const { Spacing } = SizesAndSpaces

/** Two columns on desktop, one on mobile and desktop */
const GRID_SIZE = { mobile: 12, desktop: 6 } as const

export const AdvancedDetails = ({
  chainId,
  info,
  contracts,
  prices,
  parameters,
  addressDisplay,
  managePoolLink,
  addGaugeLink,
}: {
  chainId: number
  info: Omit<InfoProps, 'chainId' | 'addressDisplay'>
  contracts: Omit<ContractsProps, 'chainId' | 'addressDisplay'>
  prices: PricesProps
  parameters: ParametersProps
  addressDisplay: AddressDisplay
  managePoolLink?: ReactNode
  addGaugeLink?: ReactNode
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
              <Info chainId={chainId} {...info} addressDisplay={addressDisplay} />
            </Grid>
          </Grid>

          <Collapse in={isOpen}>
            <Grid container columnSpacing={Spacing.md}>
              <Grid size={GRID_SIZE}>
                <Parameters {...parameters} />
              </Grid>

              <Grid size={GRID_SIZE}>
                <Prices {...prices} />
              </Grid>
            </Grid>
          </Collapse>
        </CardContent>
      </Card>

      <ViewMoreButton isOpen={isOpen} onClick={toggleOpen} />
    </Stack>
  )
}
