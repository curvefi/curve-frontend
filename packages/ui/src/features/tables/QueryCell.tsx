import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { WithWrapper } from '@ui/components/WithWrapper'
import type { QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { ErrorCell } from './ErrorCell'

const { Spacing } = SizesAndSpaces

// The skeleton is a block, so the cell's text alignment does not move it: the auto margin pushes it to the right
// TODO: delete this in the task to create skeleton categories
const skeletonProps = { width: 40, sx: { marginInlineStart: 'auto' } } as const

/** Skeleton while the query loads, error icon when it failed. Data already loaded stays visible next to the icon. */
export const QueryCell = ({
  query: { data, isLoading, error },
  children,
}: {
  query: QueryProp<unknown>
  children: ReactNode
}) => (
  <WithWrapper
    Wrapper={Stack}
    shouldWrap={error && data != null}
    direction="row"
    spacing={Spacing.xs}
    sx={{ display: 'inline-flex', alignItems: 'center' }}
  >
    {error && <ErrorCell error={error} />}
    {(!error || data != null) && (
      <WithSkeleton loading={isLoading} {...skeletonProps}>
        {children}
      </WithSkeleton>
    )}
  </WithWrapper>
)
