import * as React from 'react'
import styled from 'styled-components'

import Box from 'ui/src/Box/Box'
import Loader from 'ui/src/Loader/Loader'

type Variant = 'error' | 'warning' | 'success' | ''
type Size = 'xs' | 'sm' | 'md' | 'lg'

type Props = {
  action?: React.ReactNode
  className?: string
  isBold?: boolean | null
  isDivider?: boolean
  isMultiLine?: boolean
  label?: string | React.ReactNode
  loading?: boolean
  loadingSkeleton?: [number, number]
  size?: Size
  textLeft?: boolean
  tooltip?: React.ReactNode
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
  ...props
}: React.PropsWithChildren<Props>) => {
  const classNames = `${className} ${isDivider ? 'divider' : ''}`

  return (
    <Wrapper
      {...props}
      className={classNames}
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
            {children || '-'} {!!Tooltip && Tooltip} {Action && Action}
          </>
        )}
      </DetailValue>
    </Wrapper>
  )
}

DetailInfo.defaultProps = {
  className: '',
  size: 'sm',
}

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

interface WrapperProps extends Pick<Props, 'isDivider' | 'isMultiLine' | 'size' | 'textLeft'> {}

const Wrapper = styled(Box)<WrapperProps>`
  align-items: center;
  min-height: 1.7rem; // 27px

  ${({ size }) => {
    if (size === 'sm') {
      return `font-size: var(--font-size-2);`
    } else if (size === 'md') {
      return `font-size: var(--font-size-3);`
    }
  }};

  .svg-tooltip {
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
  ${DetailValue} {
    ${({ textLeft }) => {
      if (textLeft) {
        return `
          justify-content: flex-start;
          text-align: left;
      `
      }
    }}
  }

  .svg-tooltip {
    top: 0.2rem;
  }
`

export default DetailInfo
