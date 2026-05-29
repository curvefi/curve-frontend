import { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

interface Props {
  children: ReactNode
  type: 'numeric' | 'lower-alpha' | 'disc'
}

export const List = ({ children, type = 'numeric' }: Props) => (
  <Stack
    component="ol"
    sx={{
      gap: Spacing.xs,

      '> li': {
        listStyle: type === 'disc' ? 'none' : `${type} inside`,
        ...(type === 'disc' && {
          position: 'relative',
          paddingInlineStart: Spacing.lg,
          '&::before': {
            content: '"•"',
            position: 'absolute',
            left: 5,
            top: 2.5,
            lineHeight: 1,
            fontSize: '1em',
          },
        }),
      },

      ol: {
        marginInlineStart: Spacing.lg,
      },
    }}
  >
    {children}
  </Stack>
)
