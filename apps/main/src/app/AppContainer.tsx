import { type ReactNode, useMemo, useRef } from 'react'
import { useDexAppStats, useDexRoutes } from '@/dex/hooks/useDexAppStats'
import { useLendAppStats } from '@/lend/hooks/useLendAppStats'
import { useLoanAppStats } from '@/loan/hooks/useLoanAppStats'
import type { IChainId as CurveChainId } from '@curvefi/api/lib/interfaces'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import Box from '@mui/material/Box'
import type { NetworkDef, NetworkMapping } from '@ui/utils'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useLayoutHeight } from '@ui-kit/hooks/useResizeObserver'
import { APP_LINK, type AppName } from '@ui-kit/shared/routes'
import { Footer } from '@ui-kit/widgets/Footer'
import { Header as Header, useHeaderHeight } from '@ui-kit/widgets/Header'

const useAppStats = (currentApp: string, network: NetworkDef) =>
  ({
    dao: [],
    crvusd: useLoanAppStats(currentApp === 'crvusd' && network?.chainId === 1 ? 1 : undefined),
    lend: useLendAppStats(currentApp === 'lend' ? (network?.chainId as LlamaChainId) : undefined),
    dex: useDexAppStats(currentApp === 'dex' ? network : undefined),
  })[currentApp]

export const useAppRoutes = (chainId: CurveChainId) => ({
  dao: APP_LINK.dao.routes,
  crvusd: APP_LINK.crvusd.routes,
  lend: APP_LINK.lend.routes,
  dex: useDexRoutes(chainId),
})

export const AppContainer = <TId extends string, TChainId extends number>({
  children,
  currentApp,
  network,
  networks,
}: {
  children: ReactNode
  currentApp: AppName
  network: NetworkDef<TId, TChainId>
  networks: NetworkMapping<TId, TChainId>
}) => {
  const setLayoutHeight = useLayoutStore((state) => state.setLayoutHeight)
  const layoutHeight = useLayoutStore((state) => state.height)
  const bannerHeight = useLayoutStore((state) => state.height.globalAlert)

  const globalAlertRef = useRef<HTMLDivElement>(null)
  const mainNavRef = useRef<HTMLDivElement>(null)
  useLayoutHeight(globalAlertRef, 'globalAlert', setLayoutHeight)
  useLayoutHeight(mainNavRef, 'mainNav', setLayoutHeight)

  const minHeight = useMemo(
    () => Object.values(layoutHeight).reduce((acc, height) => acc + height, 0) - layoutHeight.footer + 24,
    [layoutHeight],
  )

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        width: '100%',
        minHeight: `calc(100vh - ${layoutHeight?.globalAlert}px)`,
      }}
    >
      <Header
        currentApp={currentApp}
        chainId={network.chainId}
        networkId={network.id}
        mainNavRef={mainNavRef}
        currentMenu={currentApp}
        networks={networks}
        globalAlertRef={globalAlertRef}
        isLite={network.isLite}
        appStats={useAppStats(currentApp, network)}
        routes={useAppRoutes(network.chainId)}
      />
      <Box
        component="main"
        sx={{
          margin: `0 auto`,
          maxWidth: `var(--width)`,
          minHeight: `calc(100vh - ${minHeight}px)`,
          width: `100%`,
          display: `flex`,
          flexDirection: `column`,
        }}
      >
        {children}
      </Box>
      <Footer appName={currentApp} networkId={network.id} headerHeight={useHeaderHeight(bannerHeight)} />
    </Box>
  )
}
