import type { ReactNode } from 'react'
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Link from '@mui/material/Link'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { MarketTypeIcon } from '@ui-kit/shared/icons/MarketTypeIcon'
import { RowSpacingIcon } from '@ui-kit/shared/icons/RowSpacingIcon'
import { SecurityIcon } from '@ui-kit/shared/icons/SecurityIcon'
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

export const Footer = () => (
  <Card
    sx={{
      paddingInline: Spacing.lg,
      paddingBlockStart: Spacing.lg,
      paddingBlockEnd: Spacing.sm,
    }}
  >
    <Grid container spacing={Spacing.lg} rowGap={Spacing.md}>
      <Grid size={12}>
        <Typography variant="headingSBold" textAlign="center">{t`What are the Peg Stability reserves?`}</Typography>
      </Grid>

      <GridItem title={t`Autonomous peg stabilization`} icon={RowSpacingIcon}>
        {t`The Peg Stability Reserves (PSDR) are smart contracts designed to automatically stabilize the crvUSD peg around $1.`}{' '}
        {t`They monitor price deviations on Curve pools and react without human input, stepping in when the market strays too far from the peg.`}{' '}
        {t`This autonomous mechanism builds trust through transparency, predictability, and continuous price targeting.`}
      </GridItem>

      <GridItem title={t`Market-based arbitrage, on-chain`} icon={MarketTypeIcon}>
        {t`When crvUSD trades below $1, peg keepers buy it from the pool and burn it. When it trades above $1, they mint new crvUSD and sell it into the pool.`}{' '}
        {t`This creates on-chain arbitrage pressure that constantly nudges the market price back to parity, much like central bank FX interventions—only fully automated and transparent.`}
      </GridItem>

      <GridItem title={t`Non-custodial & risk-isolated`} icon={SecurityIcon}>
        {t`The PSR do not touch user funds. They operate using protocol-owned liquidity and are isolated from user positions or LLAMMA (Lending-Liquidating AMM) mechanics.`}{' '}
        {t`This separation ensures that peg maintenance does not compromise user security, making the system robust by design.`}
      </GridItem>

      <Grid size={12}>
        <Button
          sx={{ width: '100%' }}
          color="ghost"
          endIcon={<ArrowOutwardIcon />}
          component={Link}
          href="https://resources.curve.finance/crvusd/faq/#peg-keepers"
          target="_blank"
        >
          Learn
        </Button>
      </Grid>
    </Grid>
  </Card>
)
