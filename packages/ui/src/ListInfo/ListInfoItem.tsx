import { ReactNode } from 'react'
import { styled } from 'styled-components'
import { Icon } from 'ui/src/Icon'
import type { TooltipProps } from 'ui/src/Tooltip/types'
import { Chip } from 'ui/src/Typography/Chip'
import { breakpoints } from 'ui/src/utils'

type Props = TooltipProps & {
  children: ReactNode
  className?: string
  isFull?: boolean
  as?: string
  mainValue?: ReactNode
  title: ReactNode
  titleNoCap?: boolean
  titleDescription?: string
  tooltip?: ReactNode
  tooltipProps?: TooltipProps
}

export const ListInfoItem = ({
  children,
  className = '',
  as,
  isFull,
  title,
  titleNoCap,
  titleDescription,
  tooltip,
  tooltipProps,
  ...props
}: Props) => {
  const { mainValue } = props
  const isMain = 'mainValue' in props
  const parsedTitleOpacity = isMain ? 1 : null

  return (
    <Wrapper
      {...props}
      {...(as ? { as } : {})}
      className={className}
      {...(isMain ? { isMain, as: 'div' } : {})}
      isFull={isFull}
    >
      {tooltip ? (
        <Chip as="strong" tooltip={tooltip} tooltipProps={tooltipProps}>
          <Title as="span" titleNoCap={titleNoCap} titleOpacity={parsedTitleOpacity}>
            <span className="label">
              {title} {titleDescription ? <TitleDescription>{titleDescription}</TitleDescription> : ''}
            </span>{' '}
            <Icon className="svg-tooltip" size={16} name="InformationSquare" />
          </Title>
        </Chip>
      ) : (
        <Title className="label" titleNoCap={titleNoCap} titleOpacity={parsedTitleOpacity}>
          {title} {titleDescription ? <TitleDescription>{titleDescription}</TitleDescription> : ''}
        </Title>
      )}
      {isMain && <MainValue>{mainValue}</MainValue>}
      {children ?? '-'}
    </Wrapper>
  )
}

const Wrapper = styled.li<{ isFull?: boolean; isMain?: boolean }>`
  display: ${({ isFull }) => (isFull ? 'flex' : 'inline-flex')};
  flex-direction: column;
  font-weight: bold;
  margin-bottom: var(--spacing-narrow);

  .tooltip-button {
    min-height: auto;
    min-width: auto;
  }

  ${({ isMain }) => {
    if (isMain) {
      return `
        border: 1px solid var(--nav_button--border-color);
        display: grid;
        padding: var(--spacing-narrow);
        margin-bottom: var(--spacing-normal);
        margin-right: 0;
        width: 100%;
      `
    }
  }};

  @media (min-width: ${breakpoints.xs}rem) {
    display: inline-flex;
    margin-bottom: 0;

    ${({ isMain }) => {
      if (isMain) {
        return `
          width: auto;
        `
      }
    }};
  }
`

const Title = styled.strong<{ titleNoCap?: boolean; titleOpacity: number | null }>`
  align-content: flex-end;
  display: block;
  font-size: var(--font-size-1);
  margin-bottom: var(--spacing-1);
  min-height: 1.1875rem;
  opacity: ${({ titleOpacity }) => titleOpacity ?? 0.6};
  white-space: nowrap;

  ${({ titleNoCap }) => !titleNoCap && `text-transform: uppercase;`};
`

const TitleDescription = styled.span`
  text-transform: initial;
`

const MainValue = styled.span`
  font-size: var(--font-size-6);
`
