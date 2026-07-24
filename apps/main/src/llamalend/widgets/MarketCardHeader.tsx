import type { ReactNode } from 'react'
import CardHeader from '@mui/material/CardHeader'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { ButtonSize, Padding } = SizesAndSpaces

export const MarketCardHeader = ({ title, action }: { title: string; action?: ReactNode }) => (
  <CardHeader
    size="small"
    title={title}
    action={action}
    slotProps={{ title: { component: 'h2' } }}
    sx={theme => ({
      alignItems: 'end',
      '&&': { minHeight: ButtonSize.sm, padding: 0 },
      '& .MuiCardHeader-content': {
        alignSelf: 'end',
        backgroundColor: theme.design.Layer[1].Fill,
        display: 'flex',
        flex: '0 1 auto',
        flexDirection: 'column',
        justifyContent: 'center',
        maxWidth: '100%',
        minHeight: ButtonSize.sm,
        minWidth: 0,
        paddingInline: Padding.Card.sm,
        width: 'fit-content',
      },
      '& .MuiCardHeader-title': theme.typography.headingXsBold,
      '& .MuiCardHeader-action': { alignSelf: 'end', margin: 0, marginInlineStart: 'auto' },
    })}
  />
)
