import Card from '@mui/material/Card'
import Link from '@mui/material/Link'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import type { ReactNode } from 'react'
import { t } from '@lingui/macro'
import { SoftLiquidationIcon } from '@/components/PageLlamaMarkets/SoftLiquidationIcon'
import { CardStackPlusIcon } from '@/components/PageLlamaMarkets/CardStackPlusIcon'
import { SignIcon } from '@/components/PageLlamaMarkets/SignIcon'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

const GridItem = ({ children, title, icon }: { children: ReactNode; title: string; icon: ReactNode }) => (
  <Grid size={{ tablet: 4, mobile: 12 }}>
    {icon}
    <Typography variant="headingXsBold">{title}</Typography>
    <Typography variant="bodyMRegular">{children}</Typography>
  </Grid>
)

export const LendTableFooter = () => (
  <Card sx={{ paddingX: Spacing.lg, paddingTop: Spacing.lg, backgroundColor: (t) => t.design.Layer[1].Fill }}>
    <Typography variant="headingSBold" textAlign="center">{t`Why Use Llamalend?`}</Typography>
    <Box paddingY={Spacing.md}>
      <Grid container spacing={Spacing.lg}>
        <GridItem title={t`Efficient collateral`} icon={<SoftLiquidationIcon />}>
          {t`Llamalend is powered by the cutting edge LLAMA liquidation engine.`}
          {t`Soft - liquidations convert your collateral when in the collateral erosion zone to protect your from liquidations, ultimately letting improve your capital efficiency.`}
        </GridItem>
        <GridItem title={t`High Security by Design`} icon={<SignIcon />}>
          {t`Isolated markets provide an efficient and risk averse strategy for decentralised lending.`}
          {t`Know your assets are protected from others.`}
        </GridItem>
        <GridItem title={t`Yield opportunities`} icon={<CardStackPlusIcon />}>
          {t`Llamalend offers yet more yield opportunities for Liquidity providers.`}
          {t`Put your idle assets to work in Llama powered markets to earn yield, or use the Llama Savings Vault to earn your share of Llamalend’s revenue.`}
        </GridItem>
      </Grid>
    </Box>

    <Button
      sx={{ width: '100%' }}
      color="ghost"
      endIcon={<ArrowOutwardIcon />}
      component={Link}
      href="https://docs.curve.fi/lending/overview/"
      target="_blank"
    >
      Learn
    </Button>
  </Card>
)
