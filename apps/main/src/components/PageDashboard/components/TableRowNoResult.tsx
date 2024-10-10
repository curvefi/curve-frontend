import React, { useMemo } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { shortenAccount } from '@/ui/utils'
import { useDashboardContext } from '@/components/PageDashboard/dashboardContext'

import { SpinnerWrapper } from '@/ui/Spinner'

type Props = {
  colSpan: number
  noResult: boolean
  error: 'error-get-dashboard-data' | ''
}

const TableRowNoResult: React.FC<Props> = ({ colSpan, noResult, error }) => {
  const {
    isLoading,
    isValidAddress,
    formValues: { walletAddress },
  } = useDashboardContext()

  const key = useMemo(() => {
    if (!walletAddress) return 'missing-address'
    if (!!walletAddress && !isValidAddress) return 'no-result'
    if (error === 'error-get-dashboard-data') return 'error-pool-list'
    if (isValidAddress && !isLoading && noResult) return 'no-result'
  }, [error, isLoading, isValidAddress, noResult, walletAddress])

  return (
    <>
      {key === 'missing-address' && (
        <tr>
          <td colSpan={colSpan}>
            <SpinnerWrapper>{t`Please connect wallet or enter a wallet address to view active pools.`}</SpinnerWrapper>
          </td>
        </tr>
      )}
      {key === 'error-pool-list' && (
        <tr>
          <td colSpan={colSpan}>
            <SpinnerWrapper>{t`Unable to get pool list`}</SpinnerWrapper>
          </td>
        </tr>
      )}
      {key === 'no-result' && (
        <tr>
          <td colSpan={colSpan}>
            <StyledSpinnerWrapper>
              {t`No active pool found for`} {walletAddress ? shortenAccount(walletAddress) : ''}
            </StyledSpinnerWrapper>
          </td>
        </tr>
      )}
    </>
  )
}

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  padding: var(--spacing-5) 0;
  width: calc(100% - 1rem);
`

export default TableRowNoResult
