import { ReactNode } from 'react'
import { styled } from 'styled-components'
import Divider from '@mui/material/Divider'
import { useReleaseChannel } from '@ui-kit/hooks/useLocalStorage'
import ActionInfo, { ActionInfoProps } from '@ui-kit/shared/ui/ActionInfo'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ReleaseChannel } from '@ui-kit/utils'
import Box from 'ui/src/Box/Box'
import Loader from 'ui/src/Loader/Loader'

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

const OldDetailInfo = ({
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
  <Wrapper
    className={`${className} ${isDivider ? 'divider' : ''}`}
    grid
    gridAutoFlow="column"
    gridColumnGap={2}
    isDivider={isDivider}
    fillWidth
  >
    {label && <DetailLabel>{label}</DetailLabel>}
    <DetailValue haveLabel={!!label} isBold={isBold} variant={variant}>
      {loading && <Loader skeleton={loadingSkeleton} />}
      {!loading && (
        <>
          {children || '-'} {!!tooltip && tooltip}
        </>
      )}
    </DetailValue>
  </Wrapper>
)

const NewDetailInfo = ({
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
      size={isBold ? 'large' : 'medium'}
    />
  </>
)

export const DetailLabel = styled.span`
  display: inline-block;
  font-weight: bold;
`

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

interface WrapperProps extends Pick<Props, 'isDivider' | 'isMultiLine'> {}

const Wrapper = styled(Box)<WrapperProps>`
  align-items: center;
  min-height: 1.7rem; // 27px
  font-size: var(--font-size-3);

  .svg-tooltip {
    margin-top: 0.25rem;
    top: 0.1rem;
  }

  .svg-arrow {
    position: relative;
    top: 0.1875rem; // 3px
    opacity: 0.7;
  }

  ${({ isDivider }) => {
    if (isDivider) {
      return `
        margin-top: var(--spacing-1);
        padding-top: var(--spacing-1);
        border-color: inherit;
        border-top: 1px solid var(--border-400);
      `
    }
  }}
  ${({ isMultiLine }) => {
    if (isMultiLine) {
      return `
        grid-auto-flow: row;
      `
    }
  }}

  .svg-tooltip {
    top: 0.2rem;
  }
`

export default function DetailInfo(props: Props) {
  const [releaseChannel] = useReleaseChannel()
  const DetailInfo = releaseChannel === ReleaseChannel.Beta ? NewDetailInfo : OldDetailInfo
  return <DetailInfo {...props} />
}
