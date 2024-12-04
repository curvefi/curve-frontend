import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'

import { Link, LinkProps } from './Link'

export type SectionProps = {
  title: string
  links: LinkProps[]
}

export const Section = ({ title, links }: SectionProps) => (
  <Grid container spacing={1}>
    <Grid size={12}>
      <Typography
        variant="headingXsBold"
        sx={{
          display: 'flex',
          alignItems: 'center',
          height: '2.5rem',
        }}
      >
        {title}
      </Typography>
    </Grid>

    {links.map((link, i) => (
      <Grid key={i} size={{ mobile: 6, tablet: 12, desktop: 12 }}>
        <Link {...link} />
      </Grid>
    ))}
  </Grid>
)
