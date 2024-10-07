import AlertBox from '@/ui/AlertBox'
import InternalLink from '@/ui/Link/InternalLink'
import Spinner from '@/ui/Spinner'
import SpinnerWrapper from '@/ui/Spinner/SpinnerWrapper'
import TextCaption from '@/ui/TextCaption'
import { t } from '@lingui/macro'
import React from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import { ContentWrapper } from '@/components/DetailsMarket/styles'
import useStore from '@/store/useStore'
import { getVaultPathname } from '@/utils/utilsRouter'


const AlertNoVaultSharesFound = ({ rOwmId, hideLink, userActiveKey }: PageContentProps & { hideLink?: boolean }) => {
  const params = useParams()

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
