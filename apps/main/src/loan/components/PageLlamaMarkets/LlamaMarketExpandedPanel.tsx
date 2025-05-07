import Link from 'next/link'
import type { ReactNode } from 'react'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import Grid from '@mui/material/Grid2'
import Stack from '@mui/material/Stack'
import { t } from '@ui-kit/lib/i18n'
import type { ExpandedPanel } from '@ui-kit/shared/ui/DataTable/ExpansionRow'
import { Metric } from '@ui-kit/shared/ui/Metric'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import type { LlamaMarket } from '../../entities/llama-markets'

const { Spacing } = SizesAndSpaces

const PanelSection = ({ children, title }: { children: ReactNode[]; title: ReactNode }) => (
  <Grid container spacing={Spacing.md}>
    <Grid size={12}>
      <CardHeader title={title}></CardHeader>
    </Grid>
    {children.map((child, index) => (
      <Grid size={6} key={index}>
        {child}
      </Grid>
    ))}
  </Grid>
)

// todo implement graphs
const Graph = () => (
  <svg width="173" height="40" viewBox="0 0 173 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1 39L2.34349 35.4264C3.91218 31.2538 9.32692 30.1965 12.35 33.4726V33.4726C14.9603 36.3012 19.5229 35.9683 21.6949 32.7907L22.8204 31.1442C24.491 28.7003 28.1757 28.3214 30.438 30.2308V30.2308C33.9013 33.1538 38.2304 34.1282 39.0962 30.2308C39.5058 28.387 40.9447 23.7268 42.4105 19.1512C43.6104 15.4055 48.4441 14.4032 50.7848 17.5641V17.5641C52.0644 19.2921 54.5259 23.6094 56.4226 27.0562C57.5299 29.0684 59.4209 30.5539 61.6791 30.9729C67.4032 32.035 74.8967 32.77 75.4608 30.2308C75.7932 28.7343 76.7373 26.4298 77.8048 24.1145C79.189 21.1124 83.2794 20.9378 85.0798 23.7103L85.4902 24.3424C87.1648 26.9213 91.0171 26.6712 92.3443 23.8974V23.8974C93.6715 21.1237 97.5238 20.8736 99.1984 23.4525L99.4188 23.7919C101.219 26.5638 105.375 26.2351 106.717 23.2148L109.228 17.5641L113.24 6.59781C114.34 3.59285 117.784 2.18224 120.675 3.55238V3.55238C122.432 4.38464 123.61 6.09111 123.767 8.02844L124.472 16.755C124.756 20.2693 129.157 21.6732 131.423 18.9725V18.9725C132.172 18.0797 133.278 17.5641 134.444 17.5641H136.068H147.324H147.809C149.629 17.5641 151.287 18.6088 152.073 20.2503V20.2503C153.868 24.0034 159.287 23.7724 160.757 19.8802L163.761 11.9264C164.057 11.1427 164.474 10.4104 164.997 9.7562L172 1"
      stroke="#32CE79"
      stroke-width="2"
    />
  </svg>
)

export const LlamaMarketExpandedPanel: ExpandedPanel<LlamaMarket> = ({
  row: {
    original: {
      liquidityUsd,
      rates: { borrow, lend },
      userHasPosition,
      utilizationPercent,
      url,
    },
  },
}) => (
  <Card>
    <Stack gap={Spacing.lg} marginBlockStart={Spacing.md} direction="column">
      <PanelSection title={t`Market Details`}>
        <Metric label={t`7D Avg Borrow Rate`} value={borrow} unit="percentage" />
        <Graph />
        {lend && (
          <>
            <Metric label={t`7D Avg Supply Rate`} value={lend} unit="percentage" />
            <Graph />
          </>
        )}
        <Metric label={t`Available Liquidity`} value={liquidityUsd} unit="dollar" />
        <Metric label={t`Utilization`} value={utilizationPercent} unit="percentage" />
      </PanelSection>
      {userHasPosition && (
        //  todo: get the data
        <PanelSection title={t`Your Position`}>
          <Metric label={t`Earnings`} value={0} unit="percentage" />
          <Metric label={t`Supplied Amount`} value={0} unit="percentage" />
        </PanelSection>
      )}
      <Button sx={{ flexGrow: 1 }} component={Link} href={url} color="navigation">
        {t`Go To Market`}
      </Button>
    </Stack>
  </Card>
)
