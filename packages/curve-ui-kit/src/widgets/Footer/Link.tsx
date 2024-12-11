import LinkMui from '@mui/material/Link'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactNode } from 'react'
import { SizesAndSpaces } from 'curve-ui-kit/src/themes/design/1_sizes_spaces'

export type LinkProps = {
  label: string
  href: string
  icon?: ReactNode
  target?: string
}

export const Link = ({ label, href, icon, target = '_blank' }: LinkProps) => (
  <LinkMui
    href={href}
    target={target}
    rel="noreferrer"
    underline="hover"
    sx={{
      display: 'grid',
      gridTemplateColumns: '1rem 1fr',
      gap: SizesAndSpaces.Spacing.sm,
    }}
  >
    <Box
      sx={{
        '& svg': {
          width: '100%',
          height: '100%',
        },
      }}
    >
      {icon}
    </Box>

    <Typography
      variant="bodyMRegular"
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: SizesAndSpaces.ButtonSize.xs,
      }}
    >
      {label}
    </Typography>
  </LinkMui>
)
