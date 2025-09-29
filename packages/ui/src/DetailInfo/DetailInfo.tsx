import { ReactNode } from 'react'
import { styled } from 'styled-components'
import Divider from '@mui/material/Divider'
import ActionInfo, { ActionInfoSize } from '@ui-kit/shared/ui/ActionInfo'

type Variant = 'error' | 'warning' | 'success' | ''
type Size = 'xs' | 'sm' | 'md' | 'lg'

const SizeMap = {
  xs: 'small',
  sm: 'small',
  md: 'medium',
  lg: 'large',
} satisfies Record<Size, ActionInfoSize>

type Props = {
  children: ReactNode
  action?: ReactNode
  className?: string
  isBold?: boolean | null
  isDivider?: boolean
  isMultiLine?: boolean
  label?: ReactNode
  loading?: boolean
  loadingSkeleton?: [number, number]
  size?: Size
  textLeft?: boolean
  tooltip?: ReactNode
  variant?: Variant
}

const DetailInfo = ({
  action: Action,
  className,
  isBold,
  isDivider,
  label,
  loading,
  loadingSkeleton,
  tooltip: Tooltip,
  variant,
  children,
  size = 'sm',
  ...props
}: Props) => (
  <>
    {isDivider && <Divider />}
    <ActionInfo
      {...props}
      className={className}
      size={SizeMap[size]}
      loading={loading}
      label={label}
      copy={typeof children === 'string'}
      value={
        <DetailValue haveLabel={!!label} isBold={isBold} variant={variant}>
          {!loading && (
            <>
              {children || '-'} {!!Tooltip && Tooltip} {Action && Action}
            </>
          )}
        </DetailValue>
      }
      copyValue={typeof children === 'string' ? children : ''}
    />
  </>
)

type DetailValeProps = {
  haveLabel: boolean
  isBold?: boolean | null
  variant?: Variant
}

const DetailValue = styled.div<DetailValeProps>`
  align-items: center;
  display: flex;
  justify-content: flex-end;

  font-weight: ${({ isBold }) => (isBold ? '700' : 'inherit')};
  text-align: ${({ haveLabel }) => (haveLabel ? 'right' : 'left')};

  color: ${({ variant }) => {
    if (variant === 'error') {
      return 'var(--danger-400)'
    } else if (variant === 'warning') {
      return 'var(--warning-text-400)'
    } else if (variant === 'success') {
      return 'var(--success-400)'
    } else {
      return 'inherit'
    }
  }};
`

export default DetailInfo
