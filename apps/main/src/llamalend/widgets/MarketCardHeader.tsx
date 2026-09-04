import type { ReactNode } from 'react'
import CardHeader from '@mui/material/CardHeader'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'

const { ButtonSize, Spacing, Tab } = SizesAndSpaces

/** TODO: this shouldn't have been a new component, we need to update all card headers to this new styling in mui-card-header.ts */
export const MarketCardHeader = ({
  title,
  action,
  disableUpperCase = false,
}: {
  title: ReactNode
  action?: ReactNode
  disableUpperCase?: boolean
}) => (
  <CardHeader
    title={title}
    action={action}
    slotProps={{ title: { style: disableUpperCase ? { textTransform: 'none' } : undefined } }}
    sx={theme => ({
      '&&': { minHeight: ButtonSize.sm, padding: 0 },
      '& .MuiCardHeader-content': {
        backgroundColor: theme.design.Layer[1].Fill,
        display: 'flex',
        flex: '0 1 auto',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: ButtonSize.sm,
        paddingInline: Spacing[Tab.Padding.medium.inline],
      },
      '& .MuiCardHeader-title': { color: theme.design.Tabs.Contained.Current.Label },
      '& .MuiCardHeader-action': {
        alignSelf: 'end',
        margin: 0,
        paddingBlockEnd: Spacing.xs,
        marginInlineStart: 'auto',
      },
    })}
  />
)
