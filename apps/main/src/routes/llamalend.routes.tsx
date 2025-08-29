import Integrations from '@/lend/components/PageIntegrations/Page'
import networks, { networksIdMapper } from '@/lend/networks'
import useStore from '@/lend/store/useStore'
import type { UrlParams } from '@/lend/types/lend.types'
import { LlamaMarketsPage } from '@/llamalend/LlamaMarketsPage/LlamaMarketsPage'
import { createRoute, Outlet } from '@tanstack/react-router'
import { useParams } from '@ui-kit/hooks/router'
import { useHydration } from '@ui-kit/hooks/useHydration'
import { useRedirectToEth } from '@ui-kit/hooks/useRedirectToEth'
import { useGasInfoAndUpdateLib } from '@ui-kit/lib/model/entities/gas-info'
import { Disclaimer } from '@ui-kit/widgets/Disclaimer'
import { rootRoute } from './root.routes'
import { redirectTo } from './util'

function LlamalendLayout() {
  const { network: networkId = 'ethereum' } = useParams<Partial<UrlParams>>()
  const chainId = networksIdMapper[networkId]
  const hydrate = useStore((s) => s.hydrate)
  const isHydrated = useHydration('llamaApi', hydrate, chainId)

  useRedirectToEth(networks[chainId], networkId, isHydrated)
  useGasInfoAndUpdateLib({ chainId, networks })

  return isHydrated && <Outlet />
}

const llamalendLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'llamalend',
  component: LlamalendLayout,
})

const layoutProps = { getParentRoute: () => llamalendLayoutRoute }

export const llamalendRoutes = llamalendLayoutRoute.addChildren([
  createRoute({
    path: '$network',
    loader: ({ params: { network } }) => redirectTo(`/llamalend/${network}/markets/`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/disclaimer',
    component: () => <Disclaimer currentApp="llamalend" />,
    head: () => ({
      meta: [{ title: 'Risk Disclaimer - Curve Llamalend' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/integrations',
    component: Integrations,
    head: () => ({
      meta: [{ title: 'Integrations - Curve Llamalend' }],
    }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/markets',
    component: LlamaMarketsPage,
    head: () => ({
      meta: [{ title: 'Llamalend Markets - Curve' }],
    }),
    ...layoutProps,
  }),
])
