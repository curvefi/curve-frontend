import LinkMui from '@mui/material/Link'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import { ReactNode } from 'react'
import { SizesAndSpaces } from 'curve-ui-kit/src/themes/design/1_sizes_spaces'
import { Fonts } from 'curve-ui-kit/src/themes/typography'

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
      variant="ghost"
      sx={{
        display: 'flex',
        alignItems: 'center',
        height: '1.5rem',
        fontFamily: Fonts['Mona Sans'],
        fontSize: SizesAndSpaces.FontSize.md,
        // In dark mode the bolder font is very hard to read.
        fontWeight: (t) =>
          t.palette.mode === 'dark' ? SizesAndSpaces.FontWeight.Normal : SizesAndSpaces.FontWeight.Medium,
      }}
    >
      {label}
    </Typography>
  </LinkMui>
)
