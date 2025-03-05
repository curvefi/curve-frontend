import { t } from '@ui-kit/lib/i18n'
import styled from 'styled-components'
import { getVaultPathname } from '@/lend/utils/utilsRouter'
import useStore from '@/lend/store/useStore'
import { ContentWrapper } from '@/lend/components/DetailsMarket/styles'
import AlertBox from '@ui/AlertBox'
import InternalLink from '@ui/Link/InternalLink'
import SpinnerWrapper from '@ui/Spinner/SpinnerWrapper'
import Spinner from '@ui/Spinner'
import TextCaption from '@ui/TextCaption'
import { PageContentProps, type UrlParams } from '@/lend/types/lend.types'
import { useParams } from 'next/navigation'

const AlertNoVaultSharesFound = ({ rOwmId, hideLink, userActiveKey }: PageContentProps & { hideLink?: boolean }) => {
  const params = useParams() as UrlParams

  const userMarketBalances = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])

  return typeof userMarketBalances === 'undefined' || !rOwmId ? (
    <SpinnerWrapper>
      <Spinner />
    </SpinnerWrapper>
  ) : +userMarketBalances.vaultShares === 0 ? (
    <ContentWrapper paddingTop>
      <StyledAlertBox alertType="">
        <TextCaption isCaps isBold>
          {t`No supply details found for this market`}
          {hideLink ? (
            ''
          ) : (
            <>
              ,{' '}
              <InternalLink $noStyles href={getVaultPathname(params, rOwmId, '')}>
                click here
              </InternalLink>{' '}
              to lend
            </>
          )}
          .
        </TextCaption>
      </StyledAlertBox>
    </ContentWrapper>
  ) : null
}

const StyledAlertBox = styled(AlertBox)`
  align-items: center;
  display: flex;
  padding: var(--spacing-normal);
  justify-content: center;
`

export default AlertNoVaultSharesFound
