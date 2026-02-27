import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { CardStackPlusIcon } from '@ui-kit/shared/icons/CardStackPlusIcon'
import { SignIcon } from '@ui-kit/shared/icons/SignIcon'
import { SoftLiquidationIcon } from '@ui-kit/shared/icons/SoftLiquidationIcon'
import { ExternalLink } from '@ui-kit/shared/ui/ExternalLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing, IconSize } = SizesAndSpaces

const GridItem = ({ children, title, icon: Icon }: { children: ReactNode; title: string; icon: typeof SvgIcon }) => (
  <Grid size={{ tablet: 4, mobile: 12 }} sx={{ marginBlock: { mobile: Spacing.lg.mobile } }}>
    <Icon sx={{ fontSize: IconSize.xxl }} />
    <Typography variant="headingXsBold" sx={{ marginBlock: Spacing.sm }}>
      {title}
    </Typography>
    <Typography variant="bodyMRegular" color="text.secondary">
      {children}
    </Typography>
  </Grid>
)

export const LendTableFooter = () => (
  <Card
    sx={{
      paddingInline: Spacing.lg,
      paddingBlockStart: Spacing.lg,
      paddingBlockEnd: Spacing.sm,
    }}
  >
    <Grid container spacing={Spacing.lg} rowGap={Spacing.md}>
      <Grid size={12}>
        <Typography variant="headingSBold" textAlign="center">{t`Why Use Llamalend?`}</Typography>
      </Grid>
      <GridItem title={t`Efficient collateral`} icon={SoftLiquidationIcon}>
        {t`Llamalend is powered by the cutting edge LLAMMA liquidation engine.`}{' '}
        {t`Soft - liquidations convert your collateral when in the collateral erosion zone to protect your from liquidations, ultimately letting improve your capital efficiency.`}
      </GridItem>
      <GridItem title={t`High Security by Design`} icon={SignIcon}>
        {t`Isolated markets provide an efficient and risk averse strategy for decentralised lending.`}{' '}
        {t`Know your assets are protected from others.`}
      </GridItem>
      <GridItem title={t`Yield opportunities`} icon={CardStackPlusIcon}>
        {t`Llamalend offers yet more yield opportunities for Liquidity providers.`}{' '}
        {t`Put your idle assets to work in Llama powered markets to earn yield, or use the Llama Savings Vault to earn your share of Llamalend’s revenue.`}
      </GridItem>
      <Grid size={12}>
        <Box display="flex" justifyContent="center">
          <ExternalLink href="https://docs.curve.finance/lending/overview/" label={t`Learn More`} />
        </Box>
      </Grid>
    </Grid>
  </Card>
)
