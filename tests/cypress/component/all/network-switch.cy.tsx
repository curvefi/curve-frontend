import { oneViewport } from '@cy/support/ui'
import { Chain } from '@primitives/network.utils'
import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  useLocation,
  useMatches,
} from '@tanstack/react-router'
import { replaceNetworkInPath } from '@ui/features/layout/routes'
import { ChainSwitcher } from '@ui/features/layout/switch-chain'
import type { ChainListOption } from '@ui/features/layout/switch-chain/ChainList'
import { getNetworkSwitchHref } from '@ui/features/layout/switch-chain/switch-policies'
import { q } from '@ui/features/queries/util'
import { ThemeProvider } from '@ui/features/themes/ThemeProvider'

const ethereum: ChainListOption = {
  chainId: Chain.Ethereum,
  blockchainId: 'ethereum',
  name: 'Ethereum',
  href: '/dex/ethereum/',
  isConfigured: true,
  isTestnet: false,
  isLite: false,
}
const arbitrum: ChainListOption = {
  ...ethereum,
  chainId: Chain.Arbitrum,
  blockchainId: 'arbitrum',
  name: 'Arbitrum',
  href: '/dex/arbitrum/',
}
const tvls = q({ data: { ethereum: 2, arbitrum: 1 }, isLoading: false, error: null })

function mountSwitcher({
  options = [ethereum, arbitrum],
  initialEntry = '/dex/ethereum/pools',
  onLoad,
}: {
  options?: ChainListOption[]
  initialEntry?: string
  onLoad?: (event: { network: string; preload: boolean; search: unknown }) => void
} = {}) {
  const Layout = () => {
    const location = useLocation()
    const blockchainId = location.pathname.split('/')[2]
    const policy = useMatches().findLast(match => match.staticData.networkSwitch)?.staticData.networkSwitch ?? {
      type: 'same-page',
    }
    return (
      <>
        <ChainSwitcher
          networkSwitch={policy}
          currentNetwork={options.find(option => option.blockchainId === blockchainId)}
          supportedNetworks={options.map(option => ({
            ...option,
            href: getNetworkSwitchHref(location, option.blockchainId, policy),
          }))}
          tvls={tvls}
        />
        <output data-testid="location">{location.href}</output>
        <output data-testid="search">{JSON.stringify(location.search)}</output>
      </>
    )
  }
  const root = createRootRoute({ component: Layout })
  const pools = createRoute({
    getParentRoute: () => root,
    path: '/dex/$network/pools',
    staticData: { networkSwitch: { type: 'same-page', clearSearchParams: ['page'] } },
    beforeLoad: ({ params, preload, location }) =>
      onLoad?.({ network: params.network, preload, search: location.search }),
  })
  const pool = createRoute({
    getParentRoute: () => root,
    path: '/dex/$network/pools/$poolId',
    staticData: { networkSwitch: { type: 'locked' } },
  })
  const position = createRoute({ getParentRoute: () => pool, path: 'position' })
  const integrations = createRoute({ getParentRoute: () => root, path: '/dex/$network/integrations' })
  const router = createRouter({
    routeTree: root.addChildren([pools, pool.addChildren([position]), integrations]),
    history: createMemoryHistory({ initialEntries: [initialEntry] }),
    defaultPreload: 'intent',
    defaultPreloadDelay: 0,
  })
  cy.mount(
    <ThemeProvider theme="light">
      <RouterProvider router={router} />
    </ThemeProvider>,
  )
  return router
}

describe('ChainSwitcher navigation', () => {
  beforeEach(() => {
    const [width, height] = oneViewport()
    cy.viewport(width, height)
  })

  it('replaces the network in URLs without changing their suffixes', () => {
    expect(replaceNetworkInPath('/bridge/ethereum?tab=native#bridge%2Fstep%25', 'arbitrum')).to.equal(
      '/bridge/arbitrum?tab=native#bridge%2Fstep%25',
    )
    const suffix = '/pools/USDC%2FETH%20%CE%94?chain=ethereum&chain=optimism&search=USD%2B+ETH#pool%2Fposition%25'
    expect(replaceNetworkInPath('/dex/ethereum' + suffix, 'arbitrum')).to.equal('/dex/arbitrum' + suffix)
    expect(replaceNetworkInPath('/dex', 'ethereum')).to.equal('/dex/ethereum')
    expect(replaceNetworkInPath('/', 'ethereum')).to.equal('/')
  })

  it('closes a single-option selector on Enter and click without navigating', () => {
    const href = '/dex/ethereum/pools?page=4&search=USDC#positions'
    const router = mountSwitcher({ options: [ethereum], initialEntry: href })
    cy.spy(router, 'navigate').as('navigate')
    cy.get('[data-testid="btn-change-chain"]').click()
    cy.get('[data-testid="menu-item-chain-ethereum"]')
      .should(item => expect(item).not.to.have.attr('href'))
      .focus()
    cy.press(Cypress.Keyboard.Keys.ENTER)
    cy.get('[role="dialog"]').should('not.exist')
    cy.get('[data-testid="location"]').should('have.text', href)
    cy.get('[data-testid="btn-change-chain"]').click()
    cy.get('[data-testid="menu-item-chain-ethereum"]')
      .should(item => expect(item).not.to.have.attr('href'))
      .click()
    cy.get('[role="dialog"]').should('not.exist')
    cy.get('[data-testid="location"]').should('have.text', href)
    cy.get('@navigate').should('not.have.been.called')
  })

  it('switches by default and closes the selector when inheriting a locked detail route policy', () => {
    const router = mountSwitcher({ initialEntry: '/dex/ethereum/integrations' })
    cy.get('[data-testid="btn-change-chain"]').click()
    cy.get('[role="dialog"]').should('be.visible')
    cy.get('[data-testid="menu-item-chain-arbitrum"]').should('have.attr', 'href', '/dex/arbitrum/integrations')
    cy.then(() => router.navigate({ href: '/dex/ethereum/pools/test-pool/position' }))
    cy.get('[role="dialog"]').should('not.exist')
    cy.get('[data-testid="network-lock"]').should('be.visible')
    cy.get('[data-testid="btn-change-chain"]').click()
    cy.get('[role="dialog"]').should('not.exist')
    cy.then(() => router.navigate({ href: '/dex/ethereum/integrations' }))
    cy.get('[role="dialog"]').should('not.exist')
  })

  it('preserves filters and encoded fragments for links, preload and navigation, clearing pagination', () => {
    const filters = { chains: ['ethereum', 'arbitrum'], search: 'USD+ ETH' }
    const search = `?chains=${encodeURIComponent(JSON.stringify(filters.chains))}&search=USD%2B+ETH&page=4`
    mountSwitcher({ initialEntry: `/dex/ethereum/pools${search}#pool%2Fposition%25`, onLoad: cy.stub().as('load') })
    cy.get('[data-testid="btn-change-chain"]').click()
    cy.get('a[data-testid="menu-item-chain-arbitrum"]')
      .invoke('attr', 'href')
      .should(href => {
        const target = new URL(href!, 'https://curve.finance')
        expect(target.pathname).to.equal('/dex/arbitrum/pools')
        expect(target.searchParams.get('chains')).to.equal(JSON.stringify(filters.chains))
        expect(target.searchParams.get('search')).to.equal(filters.search)
        expect(target.searchParams.has('page')).to.equal(false)
        expect(target.hash).to.equal('#pool%2Fposition%25')
      })
    cy.get('[data-testid="menu-item-chain-arbitrum"]').focus()
    cy.get('@load').should('have.been.calledWithExactly', { network: 'arbitrum', preload: true, search: filters })
    cy.get('[data-testid="menu-item-chain-arbitrum"]').click()
    cy.get('[role="dialog"]').should('not.exist')
    cy.get('[data-testid="location"]')
      .should('contain.text', '/dex/arbitrum/pools?')
      .and('contain.text', '#pool%2Fposition%25')
    cy.get('[data-testid="search"]')
      .invoke('text')
      .should(text => expect(JSON.parse(text)).to.deep.equal(filters))
  })
})
