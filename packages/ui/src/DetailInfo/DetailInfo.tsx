import { ReactNode } from 'react'
import Divider from '@mui/material/Divider'
import ActionInfo, { ActionInfoProps } from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

const { Spacing } = SizesAndSpaces

type Variant = 'error' | 'warning' | 'success' | ''

const VariantToColorMap = {
  '': 'textPrimary',
  error: 'error',
  warning: 'warning',
  success: 'success',
} satisfies Record<Variant, ActionInfoProps['valueColor']>

type Props = {
  children: ReactNode
  className?: string
  isBold?: boolean | null
  isDivider?: boolean
  isMultiLine?: boolean
  label?: ReactNode
  loading?: boolean
  loadingSkeleton?: [number, number]
  tooltip?: ReactNode
  variant?: Variant
}

const DetailInfo = ({
  className,
  isBold,
  isDivider,
  label,
  loading,
  loadingSkeleton,
  tooltip,
  variant,
  children,
}: Props) => (
  <>
    {isDivider && <Divider sx={{ marginBlock: Spacing.sm }} />}
    <ActionInfo
      className={className}
      label={label}
      value={children || '-'}
      valueColor={VariantToColorMap[variant || '']}
      valueTooltip={tooltip}
      copy={typeof children === 'string'}
      error={variant === 'error'}
      loading={loading && (loadingSkeleton || true)}
      copyValue={typeof children === 'string' ? children : ''}
    />
  </>
)

export default DetailInfo
