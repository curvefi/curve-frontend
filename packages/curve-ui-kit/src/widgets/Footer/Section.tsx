import Grid from '@mui/material/Grid2'
import Typography from '@mui/material/Typography'

import { SizesAndSpaces } from 'curve-ui-kit/src/themes/design/1_sizes_spaces'

import { Link, LinkProps } from './Link'

export type SectionProps = {
  title: string
  links: LinkProps[]

  networkName: string
}

export const Section = ({ title, links, networkName }: SectionProps) => (
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

    {links.map((link) => {
      return (
        <Grid key={link.href} size={{ mobile: 6, tablet: 12 }}>
          <Link {...link} networkName={networkName} />
        </Grid>
      )
    })}
  </Grid>
)
