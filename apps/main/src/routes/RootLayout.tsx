import { useMemo } from 'react'
import { StyleSheetManager } from 'styled-components'
import { WagmiProvider } from 'wagmi'
import { useStore as useDaoStore } from '@/dao/store/useStore'
import { useNetworksQuery } from '@/dex/entities/networks'
import { useStore as useDexStore } from '@/dex/store/useStore'
import { useStore as useLendStore } from '@/lend/store/useStore'
import { useStore as useLoanStore } from '@/loan/store/useStore'
import { GlobalLayout } from '@/routes/GlobalLayout'
import isPropValid from '@emotion/is-prop-valid'
import { OverlayProvider } from '@react-aria/overlays'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { HeadContent, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { CurveProvider } from '@ui-kit/features/connect-wallet'
import { HydratorMap } from '@ui-kit/features/connect-wallet/lib/types'
import { useWagmiConfig } from '@ui-kit/features/connect-wallet/lib/wagmi/useWagmiConfig'
import { useUserProfileStore } from '@ui-kit/features/user-profile'
import { usePathname } from '@ui-kit/hooks/router'
import { useLayoutStoreResponsive } from '@ui-kit/hooks/useLayoutStoreResponsive'
import { useNetworkFromUrl } from '@ui-kit/hooks/useNetworkFromUrl'
import { useOnChainUnavailable } from '@ui-kit/hooks/useOnChainUnavailable'
import { persister, queryClient, QueryProvider } from '@ui-kit/lib/api'
import { t } from '@ui-kit/lib/i18n'
import { getCurrentApp } from '@ui-kit/shared/routes'
import { ThemeProvider } from '@ui-kit/shared/ui/ThemeProvider'
import { isCypress } from '@ui-kit/utils'
import { ErrorBoundary } from '@ui-kit/widgets/ErrorBoundary'

/**
 * This implements the default behavior from styled-components v5
 * For HTML elements, forward the prop if it is a valid HTML attribute. For other elements, forward all props.
 * TODO: Use transient props: https://styled-components.com/docs/faqs#transient-props-since-5.1
 */
const shouldForwardProp = (propName: string, target: unknown) => typeof target !== 'string' || isPropValid(propName)

function useHydrationMethods(): HydratorMap {
  const crvusd: HydratorMap['crvusd'] = useLoanStore().hydrate
  const dao: HydratorMap['dao'] = useDaoStore().hydrate
  const dex: HydratorMap['dex'] = useDexStore().hydrate
  const lend: HydratorMap['lend'] = useLendStore().hydrate
  return useMemo(() => ({ crvusd, dao, dex, lend }), [crvusd, dao, dex, lend])
}

// Inner component that uses TanStack Query hooks
const NetworkAwareLayout = () => {
  const { data: networks } = useNetworksQuery()
  const network = useNetworkFromUrl(networks)
  const currentApp = getCurrentApp(usePathname())
  const onChainUnavailable = useOnChainUnavailable(networks)
  const hydrate = useHydrationMethods()
  const config = useWagmiConfig(networks)

  useLayoutStoreResponsive()

  return (
    config &&
    networks && (
      <WagmiProvider config={config}>
        <CurveProvider app={currentApp} network={network} onChainUnavailable={onChainUnavailable} hydrate={hydrate}>
          {network && (
            <GlobalLayout currentApp={currentApp} network={network} networks={networks}>
              <HeadContent />
              <Outlet />
            </GlobalLayout>
          )}
        </CurveProvider>
      </WagmiProvider>
    )
  )
}

export const RootLayout = () => {
  const theme = useUserProfileStore((state) => state.theme)
  const devTools = !isCypress
  return (
    <StyleSheetManager shouldForwardProp={shouldForwardProp}>
      <ThemeProvider theme={theme}>
        <ErrorBoundary title={t`Layout error`}>
          <OverlayProvider>
            <QueryProvider persister={persister} queryClient={queryClient}>
              <NetworkAwareLayout />
              {devTools && <ReactQueryDevtools />}
            </QueryProvider>
          </OverlayProvider>
          {devTools && <TanStackRouterDevtools />}
        </ErrorBoundary>
      </ThemeProvider>
    </StyleSheetManager>
  )
}
