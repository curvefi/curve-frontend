import { asAddress, shortenAddress } from '@/features/connect-wallet/address'
import { StellarConnectModal } from '@/features/connect-wallet/StellarConnectModal'
import { useWallet } from '@/features/connect-wallet/useWallet'
import { STELLAR_NETWORKS } from '@/lib/networks'
import { recordEntries } from '@primitives/objects.utils'
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
const CHAIN_OPTIONS: ChainListOption[] = recordEntries(STELLAR_NETWORKS).map(([blockchainId, n]) => ({
  ...n,
  blockchainId,
  isConfigured: true,
  href: `/${APP}/${blockchainId}`,
}))

const PLACEHOLDERS = {
  notImplementedCallback: () => {
    notify(t`Wallet network switching is not implemented yet.`, 'error')
    return Promise.resolve()
  },
  chain: CHAIN_OPTIONS[0],
  stats: [],
  tvl: constQ<Record<string, number>>({}),
}

export const StellarNetworkAwareLayout = () => {
  const { network } = useParams<{ network?: string }>()
  const { address, connect, disconnect, isConnected, isConnecting, error } = useWallet()
  const backendMaintenance = useMaintenance(BACKEND_MAINTENANCE)

  const chain = CHAIN_OPTIONS.find(chain => chain.blockchainId === network) ?? PLACEHOLDERS.chain
  const formatUrl = (page: string) => `${chain.href}${page}`
  const pages = [{ label: t`Pools`, href: formatUrl('/pools') }]
  const userAddress = asAddress(address)
  return (
    <ErrorBoundary title={t`Root route error`} userAddress={userAddress}>
      <HeadContent />
      <BackendMaintenanceGuard maintenance={backendMaintenance}>
        <PageLayout
          header={
            <Header
              banners={
                <GlobalBanner
                  rootUrl={EXTERNAL_LINKS.curve.root}
                  connectError={error}
                  switchChain={PLACEHOLDERS.notImplementedCallback}
                  // TODO: Read the wallet network; the existing chain IDs do not distinguish mainnet from testnet.
                  walletChainId={chain.chainId}
                  chainName={chain.name}
                  chainId={chain.chainId}
                  blockchainId={chain.blockchainId}
                  backendMaintenance={backendMaintenance}
                  isConnected={isConnected}
                >
                  {null}
                </GlobalBanner>
              }
              currentNetwork={chain}
              currentMenu={APP}
              supportedNetworks={CHAIN_OPTIONS}
              appStats={PLACEHOLDERS.stats}
              pages={pages}
              links={{ dex: { label: t`DEX`, href: chain.href, pages } }}
              sections={getHeaderSections(formatUrl)}
              tvls={PLACEHOLDERS.tvl}
              connectWalletProps={{
                address: userAddress,
                addressLabel: shortenAddress(address),
                connect,
                disconnect: () => void disconnect(),
                isConnected,
                isConnecting,
              }}
            />
          }
          userAddress={userAddress}
          connectModal={<StellarConnectModal />}
          footer={<Footer sections={getFooterSections(formatUrl)} />}
        >
          <Outlet />
        </PageLayout>
        {DEV_TOOLS && <TanStackRouterDevtools />}
      </BackendMaintenanceGuard>
    </ErrorBoundary>
  )
}
