import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import { t } from '@ui-kit/lib/i18n'
import { ArrowTopRightIcon } from '@ui-kit/shared/icons/ArrowTopRightIcon'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'

export const ActionInfoLinkTooltipContent = ({
  href,
  label: label = t`Open link`,
}: {
  href: string
  label?: string
}) => (
  <Button
    component={href.startsWith('http') ? Link : RouterLink}
    href={href}
    target="_blank"
    rel="noopener"
    color="ghost"
    variant="link"
    endIcon={<ArrowTopRightIcon />}
  >
    {label}
  </Button>
)
