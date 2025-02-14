import type { AlertType } from '@ui/AlertBox/types'

import React from 'react'
import { t } from '@ui-kit/lib/i18n'
import { useNavigate, useParams } from 'react-router-dom'
import styled from 'styled-components'

import { getLoanCreatePathname } from '@/lend/utils/utilsRouter'
import useStore from '@/lend/store/useStore'

import AlertBox from '@ui/AlertBox'
import Button from '@ui/Button'

const AlertNoLoanFound = ({ alertType, owmId }: { alertType?: AlertType; owmId: string }) => {
  const params = useParams()
  const navigate = useNavigate()

  const setStateByKeyMarkets = useStore((state) => state.markets.setStateByKey)

  const hasAlertType = typeof alertType !== 'undefined'

  return (
    <>
      <StyledAlertBox alertType={alertType ?? 'info'}>{t`No loan found for this market.`}</StyledAlertBox>
      {!hasAlertType && (
        <Button
          variant="filled"
          size="large"
          onClick={() => {
            setStateByKeyMarkets('marketDetailsView', 'market')
            navigate(getLoanCreatePathname(params, owmId, 'create'))
          }}
        >
          Create loan
        </Button>
      )}
    </>
  )
}

const StyledAlertBox = styled(AlertBox)<{ alertType: AlertType }>`
  ${({ alertType }) => {
    if (alertType === '') {
      return `
        align-items: center;
        display: flex;
        padding: var(--spacing-2);
        justify-content: center;
        
        > div {
          font-size: var(--font-size-1);
          font-weight: bold;
          text-transform: uppercase;
        }
      `
    }
  }}
`

export default AlertNoLoanFound
