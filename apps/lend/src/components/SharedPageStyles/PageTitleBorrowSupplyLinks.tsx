import type { Params } from 'react-router-dom'

import { getLoanCreatePathname, getLoanManagePathname, getVaultPathname } from '@/utils/utilsRouter'
import { helpers } from '@/lib/apiLending'
import useStore from '@/store/useStore'

import { AppPageFormTitleLinks } from '@/ui/AppPage'
import InternalLink from '@/ui/Link/InternalLink'
import styled from 'styled-components'

const PageTitleBorrowSupplyLinks = ({
  rOwmId,
  params,
  activeKey,
  owmDataCachedOrApi,
}: {
  rChainId: ChainId
  rOwmId: string
  params: Params
  activeKey: 'borrow' | 'supply'
  owmDataCachedOrApi: OWMDataCacheOrApi
}) => {
  const api = useStore((state) => state.api)
  const userActiveKey = helpers.getUserActiveKey(api, owmDataCachedOrApi)

  const loanExists = useStore((state) => state.user.loansExistsMapper[userActiveKey]?.loanExists)

  const borrowPathnameFn = loanExists ? getLoanManagePathname : getLoanCreatePathname

  return (
    <AppPageFormTitleLinks>
      <StyledLink
        $noStyles
        className={activeKey === 'borrow' ? 'active' : ''}
        href={borrowPathnameFn(params, rOwmId, '')}
      >
        Borrow
      </StyledLink>{' '}
      /{' '}
      <StyledLink
        $noStyles
        className={activeKey === 'supply' ? 'active' : ''}
        href={getVaultPathname(params, rOwmId, 'deposit')}
      >
        Supply
      </StyledLink>
    </AppPageFormTitleLinks>
  )
}

const StyledLink = styled(InternalLink)`
  color: var(--nav--page--color);
  text-decoration: none;

  &.active,
  :hover.active {
    color: inherit;
    border-bottom: 3px solid var(--nav--page--color);
  }
`

export default PageTitleBorrowSupplyLinks
