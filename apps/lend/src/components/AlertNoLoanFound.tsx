import type { AlertType } from '@/ui/AlertBox/types'

import React from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import { getLoanCreatePathname } from '@/utils/utilsRouter'
import useStore from '@/store/useStore'

import AlertBox from '@/ui/AlertBox'
import InternalLink from '@/ui/Link/InternalLink'
import SpinnerWrapper from '@/ui/Spinner/SpinnerWrapper'
import Spinner from '@/ui/Spinner'
import TextCaption from '@/ui/TextCaption'

const AlertNoLoanFound = ({
  alertType,
  owmId,
  hideLink,
  userActiveKey,
}: {
  alertType?: AlertType
  owmId: string
  hideLink?: boolean
  userActiveKey: string
}) => {
  const params = useParams()

  const loanExistsResp = useStore((state) => state.user.loansExistsMapper[userActiveKey])

  const Content = (
    <>
      No loan found for this market
      {!hideLink && (
        <>
          ,{' '}
          <InternalLink $noStyles href={getLoanCreatePathname(params, owmId, 'create')}>
            click here
          </InternalLink>{' '}
          to create a new loan
        </>
      )}
      .
    </>
  )

  return typeof loanExistsResp === 'undefined' || !owmId ? (
    <SpinnerWrapper>
      <Spinner />
    </SpinnerWrapper>
  ) : !loanExistsResp.loanExists ? (
    <StyledAlertBox alertType={alertType ?? ''}>
      {!alertType ? (
        <TextCaption isCaps isBold>
          {Content}
        </TextCaption>
      ) : (
        <div>{Content}</div>
      )}
    </StyledAlertBox>
  ) : null
}

const StyledAlertBox = styled(AlertBox)<{ alertType: AlertType }>`
  ${({ alertType }) => {
    if (!alertType) {
      return `
        align-items: center;
        display: flex;
        padding: var(--spacing-normal);
        justify-content: center;
      `
    }
  }}
`

export default AlertNoLoanFound
