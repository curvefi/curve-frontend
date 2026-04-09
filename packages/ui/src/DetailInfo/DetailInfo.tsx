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

type Props = Pick<ActionInfoProps, 'label' | 'testId' | 'alignItems'> & {
  children: ReactNode
  isBold?: boolean | null
  isDivider?: boolean
  loading?: boolean
  loadingSkeleton?: [number, number]
  tooltip?: ReactNode
  variant?: Variant
}

export const DetailInfo = ({
  isBold,
  isDivider,
  loading,
  loadingSkeleton,
  tooltip,
  variant,
  children,
  ...props
}: Props) => (
  <>
    {isDivider && <Divider sx={{ marginBlock: Spacing.sm }} />}
    <ActionInfo
      value={children || '-'}
      valueColor={VariantToColorMap[variant || '']}
      valueTooltip={tooltip}
      loading={loading && (loadingSkeleton || true)}
      {...props}
      {...(isBold && { sx: { '& .MuiTypography-root': { '&': { fontWeight: 'bold' } } } })}
    />
  </>
)
