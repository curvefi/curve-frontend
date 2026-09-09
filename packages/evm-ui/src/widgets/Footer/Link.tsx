import type { FooterLink } from '@evm-ui/widgets/Footer/footer-sections.util'
import Button from '@mui/material/Button'
import LinkMui from '@mui/material/Link'
import { RouterLink } from '@ui/components/RouterLink'

export const Link = ({ label, href, icon, target = '_blank' }: FooterLink) => (
  <Button
    {...(href.startsWith('http')
      ? { component: LinkMui, href, target, rel: 'noreferrer' }
      : { component: RouterLink, href })}
    color="ghost"
    variant="link"
    startIcon={icon}
  >
    {label}
  </Button>
)
