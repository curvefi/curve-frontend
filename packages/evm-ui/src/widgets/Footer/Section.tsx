import type { FooterLink } from '@evm-ui/widgets/Footer/footer-sections.util'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { Link } from './Link'

type SectionProps = {
  title: string
  links: FooterLink[]
  isTiny: boolean
}

export const Section = ({ title, links, isTiny }: SectionProps) => (
  <Grid container spacing={1}>
    <Grid size={12}>
      <Typography
        variant="headingXsBold"
        sx={{ display: 'flex', alignItems: 'center', height: SizesAndSpaces.ButtonSize.sm }}
      >
        {title}
      </Typography>
    </Grid>

    {links.map((link, index) => (
      // eslint-disable-next-line @eslint-react/no-array-index-key -- Existing violation before enabling this rule.
      <Grid key={`${link.href}-${index}`} size={{ mobile: isTiny ? 12 : 6, tablet: 12 }} data-testid="footer-link">
        <Link {...link} />
      </Grid>
    ))}
  </Grid>
)
