import { type ReactNode } from 'react'
import { networks as daoNetworks } from '@/dao/networks'
import { useDexAppStats, useDexRoutes } from '@/dex/hooks/useDexAppStats'
import { networks as lendNetworks } from '@/lend/networks'
import { useLlamalendAppStats } from '@/llamalend/hooks/useLlamalendAppStats'
import { useLlamalendRoutes } from '@/llamalend/hooks/useLlamalendRoutes'
import { networks as crvusdNetworks } from '@/loan/networks'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import type { NetworkDef, NetworkMapping } from '@ui/utils'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useMatchRoute } from '@ui-kit/hooks/router'
import { useIsDesktop } from '@ui-kit/hooks/useBreakpoints'
import { useLendMarketSubNav } from '@ui-kit/hooks/useFeatureFlags'
import { t } from '@ui-kit/lib/i18n'
import { APP_LINK, AppMenuOption, LEND_ROUTES, type AppName } from '@ui-kit/shared/routes'
import { ScrollUpButton } from '@ui-kit/shared/ui/ScrollUpButton'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { ErrorBoundary } from '@ui-kit/widgets/ErrorBoundary'
import { Footer } from '@ui-kit/widgets/Footer'
import { Header } from '@ui-kit/widgets/Header'

const { MinHeight } = SizesAndSpaces

const LLAMALEND_APP: AppName = 'llamalend'

const LLAMALEND_APPS: AppName[] = ['crvusd', 'lend', LLAMALEND_APP]

const useAppStats = (currentApp: AppName, network: NetworkDef) => {
  const isNewLendSubNav = useLendMarketSubNav()
  const isDesktop = useIsDesktop()
  const params = useMatchRoute<{ page: string }>({
    to: `$app/$network/$page`,
  })
  const isLlamalendApp = LLAMALEND_APPS.includes(currentApp)
  const isLlamalend =
    isNewLendSubNav && isDesktop
      ? // hide header stats on lend/crvusd market pages only
        currentApp === LLAMALEND_APP || (isLlamalendApp && params && `/${params.page}` !== LEND_ROUTES.PAGE_MARKETS)
      : isLlamalendApp
  const llamalendStats = useLlamalendAppStats({ chainId: network?.chainId }, isLlamalend)
  const dexStats = useDexAppStats(currentApp === 'dex' ? network : undefined) // 'disabled' by passing undefined

  return isLlamalend ? llamalendStats : currentApp === 'dex' ? dexStats : []
}

const useAppRoutes = (network: NetworkDef) => ({
  dao: APP_LINK.dao.routes,
  llamalend: useLlamalendRoutes(),
  dex: useDexRoutes(network),
  bridge: APP_LINK.bridge.routes,
  analytics: APP_LINK.analytics.routes,
})

const useAppMenu = (app: AppName): AppMenuOption =>
  ({
    dao: 'dao' as const,
    crvusd: 'llamalend' as const,
    lend: 'llamalend' as const,
    llamalend: 'llamalend' as const,
    dex: 'dex' as const,
    bridge: 'bridge' as const,
    analytics: 'analytics' as const,
  })[app]

const useAppSupportedNetworks = (allNetworks: NetworkMapping, app: AppName) =>
  ({
    dao: daoNetworks,
    crvusd: crvusdNetworks,
    lend: lendNetworks,
    llamalend: lendNetworks,
    dex: allNetworks,
    bridge: allNetworks,
    analytics: allNetworks,
  })[app]

// when the mobile drawer is open, we want to ignore the scrollbar and expand the content to full page width
const EXPAND_WHEN_HIDDEN = { '[aria-hidden="true"] &': { width: '100vw' } }

export const GlobalLayout = <TId extends string, TChainId extends number>({
  children,
  currentApp,
  network,
  networks,
}: {
  children: ReactNode
  currentApp: AppName
  network: NetworkDef<TId, TChainId>
  networks: NetworkMapping<TId, TChainId>
}) => (
  <Stack sx={EXPAND_WHEN_HIDDEN}>
    <Header
      currentApp={currentApp}
      chainId={network.chainId}
      networkId={network.id}
      currentMenu={useAppMenu(currentApp)}
      supportedNetworks={useAppSupportedNetworks(networks, currentApp)}
      isLite={network.isLite}
      appStats={useAppStats(currentApp, network)}
      routes={useAppRoutes(network)}
    />
    <Box
      component="main"
      sx={{ margin: `0 auto`, maxWidth: `var(--width)`, minHeight: MinHeight.pageContent, width: '100%' }}
    >
      <ErrorBoundary title={t`Page error`}>{children}</ErrorBoundary>
    </Box>
    <Footer appName={currentApp} networkId={network.id} />
    <ScrollUpButton visible={useLayoutStore((state) => state.showScrollButton)} />
  </Stack>
)
