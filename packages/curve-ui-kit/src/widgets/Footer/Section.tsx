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
}

export const Section = ({ title, links, networkId, appName }: SectionProps) => (
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
        <Link {...link} appName={appName} networkId={networkId} />
      </Grid>
    ))}
  </Grid>
)
