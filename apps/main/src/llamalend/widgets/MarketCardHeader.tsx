import type { ReactNode } from 'react'
import CardHeader from '@mui/material/CardHeader'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { ButtonSize, Padding } = SizesAndSpaces

/** TODO: this shouldn't have been a new component, we need to update all card headers to this new styling in mui-card-header.ts */
export const MarketCardHeader = ({ title, action }: { title: ReactNode; action?: ReactNode }) => (
  <CardHeader
    title={title}
    action={action}
    sx={theme => ({
      '&&': { minHeight: ButtonSize.sm, padding: 0 },
      '& .MuiCardHeader-content': {
        backgroundColor: theme.design.Layer[1].Fill,
        display: 'flex',
        flex: '0 1 auto',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: ButtonSize.sm,
        paddingInline: Padding.Card.sm,
      },
      '& .MuiCardHeader-action': { alignSelf: 'end', margin: 0, marginInlineStart: 'auto' },
    })}
  />
)
