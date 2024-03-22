import React from 'react'
import styled from 'styled-components'

import Button from 'ui/src/Button'
import Icon from 'ui/src/Icon'

const AppNavMobileShowMore = ({
  children,
  buttonLabel,
  idx,
  show,
  setShow,
}: React.PropsWithChildren<{
  buttonLabel: string
  idx: number
  show: boolean
  setShow: React.Dispatch<React.SetStateAction<number>>
}>) => {
  return (
    <>
      <ShoreMoreButton size="medium" variant="text" fillWidth onClick={() => setShow(show ? -1 : idx)}>
        <strong>{buttonLabel}</strong>
        <Icon name={show ? 'CaretUp' : 'CaretDown'} size={16} aria-label={show ? 'hide' : 'show'} />
      </ShoreMoreButton>
      <ShowMoreContentWrapper className={`collapsed ${show ? 'show' : ''}`} show={show}>
        {children}
      </ShowMoreContentWrapper>
    </>
  )
}

const ShoreMoreButton = styled(Button)`
  align-items: center;
  display: flex;
  justify-content: space-between;
  min-height: 1.125rem;
`

const ShowMoreContentWrapper = styled.div<{ show: boolean }>`
  margin-bottom: var(--spacing-narrow);

  li {
    margin-top: var(--spacing-2);
    margin-left: 0;
  }

  ${({ show }) => {
    if (show) {
      return `margin-bottom: var(--spacing-narrow);`
    }
  }}
`

export default AppNavMobileShowMore
