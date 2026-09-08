import { HeadContent, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { GlobalBanner } from '@ui/features/banners/GlobalBanner'
import { ErrorBoundary } from '@ui/features/errors/ErrorBoundary'
import { Footer } from '@ui/features/layout/Footer'
import { getFooterSections } from '@ui/features/layout/Footer/footer-sections.util'
import { Header } from '@ui/features/layout/Header'
import { getHeaderSections } from '@ui/features/layout/Header/header-sections.util'
import { PageLayout } from '@ui/features/layout/PageLayout'
import type { ChainListOption } from '@ui/features/layout/switch-chain/ui/ChainList'
import { BackendMaintenanceGuard } from '@ui/features/maintenance/components/BackendMaintenanceGuard'
import { useMaintenance } from '@ui/features/maintenance/hooks/useMaintenance'
import { BACKEND_MAINTENANCE } from '@ui/features/maintenance/maintenance.config'
import { constQ } from '@ui/features/queries/util'
import { notify } from '@ui/features/toast/Toast/notify'
import { useParams } from '@ui/hooks/router'
import { IS_CYPRESS } from '@ui/lib/env'
import { t } from '@ui/lib/i18n'
import { EXTERNAL_LINKS } from '@ui/lib/resource.constants'

const DEV_TOOLS = !IS_CYPRESS

const APP = 'dex' as const
const STELLAR_NETWORKS: ChainListOption[] = [
  {
    blockchainId: 'stellar',
    name: 'Stellar',
    chainId: 1500,
    isTestnet: false,
    isLite: true,
    isConfigured: true,
    href: `/${APP}/stellar`,
  },
  {
    blockchainId: 'stellar-testnet',
    name: 'Stellar testnet',
    chainId: 1500,
    isTestnet: true,
    isLite: true,
    isConfigured: true,
    href: `/${APP}/stellar-testnet`,
  },
]

const PLACEHOLDERS = {
  user: undefined,
  connectError: undefined,
  walletError: new Error(t`The wallet connection is currently being implemented.`),
  notImplementedCallback: () => {
    notify(PLACEHOLDERS.walletError.message, 'error')
    return Promise.resolve()
  },
  chain: STELLAR_NETWORKS[0],
  isConnected: false,
  connectWalletProps: () => ({
    disconnect: PLACEHOLDERS.notImplementedCallback,
    address: PLACEHOLDERS.user,
    addressLabel: undefined,
    isConnecting: false,
    isConnected: PLACEHOLDERS.isConnected,
    connect: PLACEHOLDERS.notImplementedCallback,
  }),
  stats: [],
  tvl: constQ<Record<string, number>>({}),
  connectModal: null,
}

export const StellarNetworkAwareLayout = () => {
  const { network } = useParams<{ network?: string }>()
  const backendMaintenance = useMaintenance(BACKEND_MAINTENANCE)

  const chain = STELLAR_NETWORKS.find(chain => chain.blockchainId === network) ?? PLACEHOLDERS.chain
  const formatUrl = (page: string) => `${chain.href}${page}`
  const pages = [{ label: t`Pools`, href: formatUrl('/pools') }]
  return (
    <ErrorBoundary title={t`Root route error`} userAddress={PLACEHOLDERS.user}>
      <HeadContent />
      <BackendMaintenanceGuard maintenance={backendMaintenance}>
        <PageLayout
          header={
            <Header
              banners={
                <GlobalBanner
                  rootUrl={EXTERNAL_LINKS.curve.root}
                  connectError={PLACEHOLDERS.connectError}
                  switchChain={PLACEHOLDERS.notImplementedCallback}
                  walletChainId={chain.chainId}
                  chainName={chain.name}
                  chainId={chain.chainId}
                  blockchainId={chain.blockchainId}
                  backendMaintenance={backendMaintenance}
                  isConnected={PLACEHOLDERS.isConnected}
                >
                  {null}
                </GlobalBanner>
              }
              currentNetwork={chain}
              currentMenu={APP}
              supportedNetworks={STELLAR_NETWORKS}
              appStats={PLACEHOLDERS.stats}
              pages={pages}
              links={{ dex: { label: t`DEX`, href: chain.href, pages } }}
              sections={getHeaderSections(formatUrl)}
              tvls={PLACEHOLDERS.tvl}
              connectWalletProps={PLACEHOLDERS.connectWalletProps()}
            />
          }
          userAddress={PLACEHOLDERS.user}
          connectModal={PLACEHOLDERS.connectModal}
          footer={<Footer sections={getFooterSections(formatUrl)} />}
        >
          <Outlet />
        </PageLayout>
        {DEV_TOOLS && <TanStackRouterDevtools />}
      </BackendMaintenanceGuard>
    </ErrorBoundary>
  )
}
