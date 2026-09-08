import Card from '@mui/material/Card'
import Stack from '@mui/material/Stack'
import { createRoute, Outlet } from '@tanstack/react-router'
import { EmptyStateCard } from '@ui/components/EmptyStateCard'
import { SizesAndSpaces } from '@ui/features/themes/design/1_sizes_spaces'
import { redirectTo } from '@ui/hooks/router'
import { t } from '@ui/lib/i18n'
import { rootRoute } from './root.routes'

const { MaxWidth } = SizesAndSpaces

const dexLayoutRoute = createRoute({ getParentRoute: () => rootRoute, path: 'dex', component: Outlet })

const layoutProps = { getParentRoute: () => dexLayoutRoute }

const WipComponent = () => (
  <Stack sx={{ minHeight: 300, justifyContent: 'center' }}>
    <Card sx={{ maxWidth: MaxWidth.actionCard, margin: '0 auto' }}>
      <EmptyStateCard title={t`Work in progress`} description={t`We are working on it`} />
    </Card>
  </Stack>
)

export const dexRoutes = dexLayoutRoute.addChildren([
  createRoute({ path: '/', loader: () => redirectTo('/dex/stellar/pools/'), ...layoutProps }),
  createRoute({
    path: '$network',
    loader: ({ params: { network } }) => redirectTo(`/dex/${network}/pools/`),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/pools',
    component: WipComponent,
    head: () => ({ meta: [{ title: 'Pools - Curve Stellar' }] }),
    ...layoutProps,
  }),
  createRoute({
    path: '$network/pools/$poolIdOrAddress',
    component: WipComponent,
    head: () => ({ meta: [{ title: 'Pool - Curve Stellar' }] }),
    ...layoutProps,
  }),
])
