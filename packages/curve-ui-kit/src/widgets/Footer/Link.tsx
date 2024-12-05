import LinkMui from '@mui/material/Link'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactNode } from 'react'
import { SizesAndSpaces } from 'curve-ui-kit/src/themes/design/1_sizes_spaces'

export type LinkProps = {
  label: string
  href: string
  icon?: ReactNode
}

export const Link = ({ label, href, icon }: LinkProps) => (
  <LinkMui
    href={href}
    target="_blank"
    rel="noreferrer"
    underline="hover"
    sx={{
      display: 'grid',
      gridTemplateColumns: '16px 1fr',
      gap: SizesAndSpaces.Spacing.sm,
      alignItems: 'center',
    }}
  >
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        '& svg': {
          width: '100%',
          height: '100%',
        },
      }}
    >
      {icon ? icon : null}
    </Box>

    <Typography
      variant="bodyMRegular"
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: '1.5rem',
      }}
    >
      {label}
    </Typography>
  </LinkMui>
)
