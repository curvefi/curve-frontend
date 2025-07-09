import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import type { AppName } from '@ui-kit/shared/routes'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Link, LinkProps } from './Link'

export type SectionProps = {
  title: string
  links: Omit<LinkProps, 'networkId' | 'appName'>[]
  networkId: string
  appName: AppName
  isTiny: boolean
}

export const Section = ({ title, links, networkId, appName, isTiny }: SectionProps) => (
  <Grid container spacing={1}>
    <Grid size={12}>
      <Typography
        variant="headingXsBold"
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: SizesAndSpaces.ButtonSize.sm,
        }}
      >
        {title}
      </Typography>
    </Grid>

    {links.map((link) => (
      <Grid key={link.href} size={{ mobile: isTiny ? 12 : 6, tablet: 12 }} data-testid="footer-link">
        <Link {...link} appName={appName} networkId={networkId} />
      </Grid>
    ))}
  </Grid>
)
