import { styled } from 'styled-components'
import { useDashboardContext } from '@/dex/components/PageDashboard/dashboardContext'
import { SpinnerWrapper } from '@ui/Spinner'
import { shortenAccount } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

type Props = {
  colSpan: number
  noResult: boolean
  error: string
}

export const TableRowNoResult = ({ colSpan, error, noResult }: Props) => {
  const {
    isLoading,
    formValues: { walletAddress },
  } = useDashboardContext()

  return (
    <>
      {!walletAddress ? (
        <tr>
          <td colSpan={colSpan}>
            <SpinnerWrapper>{t`Please connect wallet or enter a wallet address to view active pools.`}</SpinnerWrapper>
          </td>
        </tr>
      ) : error ? (
        <tr>
          <td colSpan={colSpan}>
            <SpinnerWrapper>{t`Unable to get pool list`}</SpinnerWrapper>
          </td>
        </tr>
      ) : (
        !isLoading &&
        noResult && (
          <tr>
            <td colSpan={colSpan}>
              <StyledSpinnerWrapper>
                {t`No active pool found for`} {walletAddress ? shortenAccount(walletAddress) : ''}
              </StyledSpinnerWrapper>
            </td>
          </tr>
        )
      )}
    </>
  )
}

const StyledSpinnerWrapper = styled(SpinnerWrapper)`
  padding: var(--spacing-5) 0;
  width: calc(100% - 1rem);
`
