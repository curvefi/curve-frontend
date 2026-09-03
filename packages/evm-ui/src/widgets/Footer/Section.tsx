import type { AppName } from '@evm-ui/shared/routes'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { Link, LinkProps } from './Link'

type SectionProps = {
  title: string
  links: Omit<LinkProps, 'blockchainId' | 'appName'>[]
  blockchainId: string
  appName: AppName
  isTiny: boolean
}

export const Section = ({ title, links, blockchainId, appName, isTiny }: SectionProps) => (
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
        <Link {...link} appName={appName} blockchainId={blockchainId} />
      </Grid>
    ))}
  </Grid>
)
