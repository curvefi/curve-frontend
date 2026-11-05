import type { ReactNode } from 'react'
import Stack from '@mui/material/Stack'
import { WithSkeleton } from '@ui/components/WithSkeleton'
import { WithWrapper } from '@ui/components/WithWrapper'
import type { QueryProp } from '@ui/features/queries/util'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { ErrorCell } from './ErrorCell'

const { Spacing } = SizesAndSpaces

// Inline, so the skeleton follows the cell's text alignment like the loaded value
// TODO: delete this in the task to create skeleton categories
const skeletonProps = { width: 40, sx: { display: 'inline-block' } } as const

/** Skeleton while the query loads, error icon when it failed. The skeleton or loaded data stay visible next to the icon. */
export const QueryCell = ({
  query: { data, isLoading, error },
  children,
}: {
  query: QueryProp<unknown>
  children: ReactNode
}) => {
  const hasContent = isLoading || data != null
  return (
    <WithWrapper
      Wrapper={Stack}
      shouldWrap={error && hasContent}
      direction="row"
      spacing={Spacing.xs}
      sx={{ display: 'inline-flex', alignItems: 'center' }}
    >
      {error && <ErrorCell error={error} />}
      {(!error || hasContent) && (
        <WithSkeleton loading={isLoading} {...skeletonProps}>
          {children}
        </WithSkeleton>
      )}
    </WithWrapper>
  )
}
