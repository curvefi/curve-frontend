import { ReactNode } from 'react'
import Divider from '@mui/material/Divider'
import { ActionInfoProps, ActionInfo } from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type Variant = 'error' | 'warning' | 'success' | ''

/**
 * Maps the `variant` prop to the corresponding `valueColor` prop for the `ActionInfo` component.
 * This should be removed when we get rid of this file and use `ActionInfo` directly.
 * */
const VariantToColorMap = {
  '': 'textPrimary',
  error: 'error',
  warning: 'warning',
  success: 'success',
} satisfies Record<Variant, ActionInfoProps['valueColor']>

type Props = {
  children: ReactNode
  isBold?: boolean | null
  isDivider?: boolean
  isMultiLine?: boolean
  label?: ReactNode
  loading?: boolean
  loadingSkeleton?: [number, number]
  tooltip?: ReactNode
  variant?: Variant
  testId?: string
}

export const DetailInfo = ({
  isBold,
  isDivider,
  label,
  loading,
  loadingSkeleton,
  tooltip,
  variant,
  isMultiLine,
  children,
  testId,
}: Props) => (
  <>
    {isDivider && <Divider sx={{ marginBlock: Spacing.sm }} />}
    <ActionInfo
      label={label}
      value={children || '-'}
      valueColor={VariantToColorMap[variant || '']}
      valueTooltip={tooltip}
      loading={loading && (loadingSkeleton || true)}
      testId={testId}
      {...(isBold && { sx: { '& .MuiTypography-root': { '&': { fontWeight: 'bold' } } } })}
      {...(isMultiLine && { alignItems: 'flex-start' })}
    />
  </>
)
