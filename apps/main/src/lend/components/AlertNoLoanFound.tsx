import { styled } from 'styled-components'
import { useStore } from '@/lend/store/useStore'
import type { UrlParams } from '@/lend/types/lend.types'
import { getLoanPathname } from '@/lend/utils/utilsRouter'
import { AlertBox } from '@ui/AlertBox'
import type { AlertType } from '@ui/AlertBox/types'
import { Button } from '@ui/Button'
import { useParams, useNavigate } from '@ui-kit/hooks/router'
import { t } from '@ui-kit/lib/i18n'

export const AlertNoLoanFound = ({ alertType, owmId }: { alertType?: AlertType; owmId: string }) => {
  const params = useParams<UrlParams>()
  const push = useNavigate()

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
            push(getLoanPathname(params, owmId))
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
