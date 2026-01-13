import { useEffect, useMemo, useRef, useState } from 'react'
import { styled } from 'styled-components'
import type { AlertBoxProps } from '@ui/AlertBox/types'
import { Box } from '@ui/Box'
import { Icon } from '@ui/Icon'
import { IconButton } from '@ui/IconButton'

export const AlertBox = ({
  className,
  alertType,
  children,
  title,
  limitHeight,
  handleBtnClose,
  ...props
}: AlertBoxProps) => {
  const [enabledHeightToggle, setEnabledHeightToggle] = useState(false)
  const [showFullHeight, setShowFullHeight] = useState(false)
  const IconComp =
    alertType === '' ? null : (
      <StyledIcon
        className={handleBtnClose !== undefined ? 'extra-margin' : ''}
        name="InformationSquareFilled"
        size={24}
      />
    )

  const alertContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (typeof children === 'string' && children.length > 200) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEnabledHeightToggle(true)
    }
  }, [children])

  const cutAlert = useMemo(() => {
    if (typeof children === 'string' && children.length > 200 && limitHeight) {
      return `${children.substring(0, 200)}...`
    }
    return children
  }, [children, limitHeight])

  return (
    (title || children) && (
      <Wrapper className={className} alertType={alertType} enabledHeightToggle={enabledHeightToggle}>
        {title ? (
          <>
            <Header>
              {IconComp} {title}{' '}
            </Header>
            {showFullHeight ? children : cutAlert}
          </>
        ) : (
          <ContentWrapper
            data-tag="content"
            grid
            gridTemplateColumns={handleBtnClose !== undefined ? 'auto 1fr auto' : 'auto 1fr'}
            gridColumnGap={1}
            flexAlignItems={'flex-start'}
            {...props}
          >
            {IconComp}
            <Content flex showFullHeight={showFullHeight} limitHeight={limitHeight} ref={alertContentRef}>
              {showFullHeight ? children : cutAlert}
            </Content>
            {handleBtnClose !== undefined && (
              <IconButton size="small" onClick={handleBtnClose}>
                <Icon name="Close" size={24} />
              </IconButton>
            )}
          </ContentWrapper>
        )}
        {limitHeight && enabledHeightToggle && (
          <AdjustHeightWrapper>
            <ButtonContainer>
              <AdjustHeightButton onClick={() => setShowFullHeight(!showFullHeight)}>
                {showFullHeight ? 'Minimize' : 'Expand'}
                {showFullHeight ? <Icon name="ChevronUp" size={16} /> : <Icon name="ChevronDown" size={16} />}
              </AdjustHeightButton>
            </ButtonContainer>
          </AdjustHeightWrapper>
        )}
      </Wrapper>
    )
  )
}

const ContentWrapper = styled(Box)`
  font-weight: 500;
`

const Header = styled.header`
  align-items: center;
  display: flex;
  font-size: var(--font-size-4);
  font-weight: 500;
  svg {
    margin-right: var(--spacing-1);
  }
`

const Content = styled(Box)<{ showFullHeight: boolean; limitHeight?: boolean }>`
  height: 100%;
  align-items: center;
  ${(props) => props.showFullHeight && props.limitHeight && 'padding-bottom: var(--spacing-4);'}
`

const Wrapper = styled(Box)<Pick<AlertBoxProps, 'alertType'> & { enabledHeightToggle: boolean }>`
  position: relative;
  padding: var(--spacing-2);
  ${(props) => props.enabledHeightToggle && 'display: flex;'}

  color: var(--white);
  word-break: break-word;

  a:hover {
    color: inherit;
    text-decoration-color: inherit;
    text-transform: inherit;
  }

  ${({ alertType }) => {
    if (alertType === '') {
      return `
        color: inherit;
        border: 1px solid var(--border-400);
      `
    } else if (alertType === 'error' || alertType === 'danger') {
      return `background-color: var(--danger-400);`
    } else if (alertType === 'info') {
      return `background-color: var(--info-400);`
    } else if (alertType === 'warning') {
      return `
        color: black;
        background-color: var(--warning-400);
      `
    }
  }}
`

const StyledIcon = styled(Icon)`
  &.extra-margin {
    margin-top: 0.2rem;
  }
`

const AdjustHeightWrapper = styled.div`
  position: absolute;
  display: flex;
  width: calc(100% - var(--spacing-2) - var(--spacing-2));
  height: calc(100% - var(--spacing-2) - var(--spacing-2));
  pointer-events: none;
`

const ButtonContainer = styled.div`
  padding: var(--spacing-2) 0 0 var(--spacing-2);
  margin: auto 0 0 auto;
  background-color: var(--danger-400);
  pointer-events: auto;
  &:hover {
    cursor: pointer;
  }
`

const AdjustHeightButton = styled(IconButton)`
  font-size: var(--font-size-1);
  background-color: var(--danger-400);
  opacity: 1;
  padding: var(--spacing-1) var(--spacing-2);
  font-weight: var(--bold);
  min-height: 0;
  border: 1px solid var(--white);
  gap: var(--spacing-1);
  pointer-events: auto;
`
