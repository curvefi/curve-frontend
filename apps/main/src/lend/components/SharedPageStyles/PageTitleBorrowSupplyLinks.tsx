import type { Params } from 'react-router-dom'
import { getLoanCreatePathname, getLoanManagePathname, getVaultPathname } from '@/lend/utils/utilsRouter'
import { helpers } from '@/lend/lib/apiLending'
import useStore from '@/lend/store/useStore'
import { AppPageFormTitleLinks } from '@ui/AppPage'
import InternalLink from '@ui/Link/InternalLink'
import styled from 'styled-components'
import { OneWayMarketTemplate } from '@curvefi/lending-api/lib/markets'

const PageTitleBorrowSupplyLinks = ({
  params,
  activeKey,
  market,
}: {
  params: Params
  activeKey: 'borrow' | 'supply'
  market: OneWayMarketTemplate
}) => {
  const api = useStore((state) => state.api)
  const userActiveKey = helpers.getUserActiveKey(api, market)

  const loanExists = useStore((state) => state.user.loansExistsMapper[userActiveKey]?.loanExists)

  const borrowPathnameFn = loanExists ? getLoanManagePathname : getLoanCreatePathname

  return (
    <AppPageFormTitleLinks>
      <StyledLink
        $noStyles
        className={activeKey === 'borrow' ? 'active' : ''}
        href={borrowPathnameFn(params, market.id, '')}
      >
        Borrow
      </StyledLink>{' '}
      /{' '}
      <StyledLink
        $noStyles
        className={activeKey === 'supply' ? 'active' : ''}
        href={getVaultPathname(params, market.id, 'deposit')}
      >
        Lend
      </StyledLink>
    </AppPageFormTitleLinks>
  )
}

const StyledLink = styled(InternalLink)`
  color: var(--page--text-color);
  text-decoration: none;

  &.active,
  &:hover.active {
    color: inherit;
    /* border-bottom: 3px solid var(--nav--page--color); */
  }
`

export default PageTitleBorrowSupplyLinks
