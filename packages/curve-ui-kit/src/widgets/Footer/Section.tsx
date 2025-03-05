import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Link, LinkProps } from './Link'
import type { AppName } from '@ui-kit/shared/routes'

export type SectionProps = {
  title: string
  links: Omit<LinkProps, 'networkName' | 'appName'>[]
  networkName: string
  appName: AppName
}

export const Section = ({ title, links, networkName, appName }: SectionProps) => (
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
      <Grid key={link.href} size={{ mobile: 6, tablet: 12 }}>
        <Link {...link} appName={appName} networkName={networkName} />
      </Grid>
    ))}
  </Grid>
)
