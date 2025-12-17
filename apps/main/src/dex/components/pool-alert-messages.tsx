import Button from '@mui/material/Button'
import Link from '@mui/material/Link'
import Stack from '@mui/material/Stack'
import { ArrowTopRightIcon } from '@ui-kit/shared/icons/ArrowTopRightIcon'
import { RouterLink } from '@ui-kit/shared/ui/RouterLink'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

export const PoolAlertMessage = ({ children }: { children: React.ReactNode }) => (
  <Stack
    alignItems="flex-start"
    spacing={Spacing.sm}
    sx={{
      '& a': {
        wordBreak: 'break-word',
      },
    }}
  >
    {children}
  </Stack>
)

export const ExternalLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Button
    color="ghost"
    size="extraSmall"
    component={Link}
    sx={{ color: 'currentColor', textUnderlineOffset: '2px', '&:hover': { textDecoration: 'underline' } }}
    endIcon={<ArrowTopRightIcon fontSize={'small'} />}
    href={href}
    target="_blank"
    rel="noreferrer noopener"
  >
    {children}
  </Button>
)

export const InternalLink = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Button
    color="ghost"
    size="extraSmall"
    component={RouterLink}
    href={href}
    sx={{ color: 'currentColor', textUnderlineOffset: '2px', '&:hover': { textDecoration: 'underline' } }}
  >
    {children}
  </Button>
)
