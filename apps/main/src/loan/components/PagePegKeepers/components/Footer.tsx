import type { ReactNode } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import SvgIcon from '@mui/material/SvgIcon'
import Typography from '@mui/material/Typography'
import { t } from '@ui-kit/lib/i18n'
import { ArbitrageIcon } from '@ui-kit/shared/icons/ArbitrageIcon'
import { RebalancingIcon } from '@ui-kit/shared/icons/RebalancingIcon'
import { SecurityIcon } from '@ui-kit/shared/icons/SecurityIcon'
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

export const Footer = () => (
  <Card
    sx={{
      paddingInline: Spacing.lg,
      paddingBlockStart: Spacing.lg,
      paddingBlockEnd: Spacing.sm,
    }}
  >
    <Grid container spacing={Spacing.lg} rowGap={Spacing.sm}>
      <Grid size={12}>
        <Typography variant="headingSBold" textAlign="center">{t`What are the Peg Stability reserves?`}</Typography>
      </Grid>

      <GridItem title={t`Autonomous peg stabilization`} icon={RebalancingIcon}>
        <strong>{t`Peg Stability Reserves`}</strong>{' '}
        {t`(PSRs) are fully autonomous smart contracts designed to keep crvUSD close to $1. Each PSR monitors the price in a specific Curve pool.`}{' '}
        {t`When the price deviates too far from $1,`} <strong>{t`anyone can trigger a rebalance`}</strong>{' '}
        {t`action to restore the peg. These actions are only allowed when on‑chain conditions are met, and callers receive a small reward for valid execution.`}
      </GridItem>

      <GridItem title={t`Automated Market-Based Arbitrage, On-Chain`} icon={ArbitrageIcon}>
        {t`If crvUSD trades`} <strong>{t`above $1`}</strong> {t`PSR mints and adds crvUSD to the pool. If it trades`}{' '}
        <strong>{t`below $1`}</strong> {t`PSR withdraws and burns crvUSD.`}{' '}
        {t`Each PSR targets a single Curve pool with set thresholds and a debt cap. Rebalances are permissionless, rewarded, and triggered the moment conditions are met.`}
      </GridItem>

      <GridItem title={t`Non-Custodial & Risk-Isolated`} icon={SecurityIcon}>
        <strong>{t`PSRs never touch user funds or LLAMMA positions.`}</strong>{' '}
        {t`They only operate on crvUSD they mint and the LP tokens they hold — within the confines of a single Curve pool.`}{' '}
        <strong>{t`All logic is on-chain,`}</strong>{' '}
        {t`auditable, and capped by a hard-coded debt ceiling. If the ceiling is reached, minting halts. Users stay safe. The peg stays defended.`}
      </GridItem>

      <Grid size={12}>
        <Box display="flex" justifyContent="center">
          <ExternalLink href="https://resources.curve.finance/crvusd/faq/#peg-keepers" label={t`Learn More`} />
        </Box>
      </Grid>
    </Grid>
  </Card>
)
