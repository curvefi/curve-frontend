import { type RefObject, useMemo, useRef } from 'react'
import { ROUTE } from '@/dex/constants'
import { useAppStatsTvl } from '@/dex/entities/appstats-tvl'
import { useAppStatsVolume } from '@/dex/entities/appstats-volume'
import useLayoutHeight from '@/dex/hooks/useLayoutHeight'
import type { SwapFormValuesCache } from '@/dex/store/createCacheSlice'
import useStore from '@/dex/store/useStore'
import { type CurveApi } from '@/dex/types/main.types'
import { useChainId } from '@/dex/utils/utilsRouter'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { useConnection } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { APP_LINK } from '@ui-kit/shared/routes'
import { Header as NewHeader, useHeaderHeight } from '@ui-kit/widgets/Header'
import { NavigationSection } from '@ui-kit/widgets/Header/types'

type HeaderProps = {
  sections: NavigationSection[]
  globalAlertRef: RefObject<HTMLDivElement | null>
  networkId: string
}

const QuickSwap = () => t`Quickswap`
export const Header = ({ sections, globalAlertRef, networkId }: HeaderProps) => {
  const mainNavRef = useRef<HTMLDivElement>(null)
  const { lib: curve = {} } = useConnection<CurveApi>()
  const rChainId = useChainId(networkId)
  useLayoutHeight(mainNavRef, 'mainNav')

  const hasRouter = useStore((state) => state.getNetworkConfigFromApi(rChainId).hasRouter)
  const networks = useStore((state) => state.networks.networks)
  const visibleNetworksList = useStore((state) => state.networks.visibleNetworksList)
  const bannerHeight = useStore((state) => state.layoutHeight.globalAlert)
  const routerCached = useStore((state) => state.storeCache.routerFormValues[rChainId])

  const { data: tvlTotal } = useAppStatsTvl(curve)
  const { data: volumeTotal } = useAppStatsVolume(curve)

  const network = networks[rChainId]

  return (
    <NewHeader
      networkId={networkId}
      chainId={rChainId}
      mainNavRef={mainNavRef}
      currentMenu="dex"
      isLite={network?.isLite}
      routes={useMemo(
        () => [
          ...(hasRouter && (!network || network.showRouterSwap)
            ? [
                {
                  app: 'dex' as const,
                  route: _createSwapPath(network.swap, routerCached),
                  label: QuickSwap,
                },
              ]
            : []),
          ...APP_LINK.dex.routes.filter((page) => page.route !== ROUTE.PAGE_SWAP),
        ],
        [hasRouter, network, routerCached],
      )}
      chains={visibleNetworksList}
      appStats={[
        {
          label: t`Total Deposits`,
          value: formatNumber(tvlTotal, { currency: 'USD', notation: 'compact' }),
        },
        ...(network?.isLite // only show total deposits on curve-lite networks
          ? []
          : [
              {
                label: t`Daily Volume`,
                value: formatNumber(volumeTotal?.totalVolume, { currency: 'USD', notation: 'compact' }),
              },
              { label: t`Crypto Volume Share`, value: formatNumber(volumeTotal?.cryptoShare, FORMAT_OPTIONS.PERCENT) },
            ]),
      ]}
      sections={sections}
      height={useHeaderHeight(bannerHeight)}
      globalAlertRef={globalAlertRef}
    />
  )
}

function _createSwapPath(routerDefault: Record<string, string>, routerCached: SwapFormValuesCache) {
  const from = routerCached?.fromAddress ?? routerDefault?.fromAddress
  const to = routerCached?.toAddress ?? routerDefault?.toAddress
  return `${ROUTE.PAGE_SWAP}/${from || to ? `?${new URLSearchParams({ ...(from && { from }), ...(to && { to }) })}` : ''}`
}

export default Header
