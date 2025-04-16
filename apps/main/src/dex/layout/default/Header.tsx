import { useRouter } from 'next/navigation'
import { useCallback, useMemo, useRef } from 'react'
import { CONNECT_STAGE, ROUTE } from '@/dex/constants'
import { useAppStatsTvl } from '@/dex/entities/appstats-tvl'
import { useAppStatsVolume } from '@/dex/entities/appstats-volume'
import useLayoutHeight from '@/dex/hooks/useLayoutHeight'
import type { SwapFormValuesCache } from '@/dex/store/createCacheSlice'
import useStore from '@/dex/store/useStore'
import { ChainId, type CurveApi } from '@/dex/types/main.types'
import { getPath, useNetworkFromUrl, useRestPartialPathname } from '@/dex/utils/utilsRouter'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { isLoading, useConnection } from '@ui-kit/features/connect-wallet'
import { t } from '@ui-kit/lib/i18n'
import { APP_LINK } from '@ui-kit/shared/routes'
import { GlobalBannerProps } from '@ui-kit/shared/ui/GlobalBanner'
import { Header as NewHeader, useHeaderHeight } from '@ui-kit/widgets/Header'
import { NavigationSection } from '@ui-kit/widgets/Header/types'

type HeaderProps = { sections: NavigationSection[]; BannerProps: GlobalBannerProps }

const QuickSwap = () => t`Quickswap`
export const Header = ({ sections, BannerProps }: HeaderProps) => {
  const mainNavRef = useRef<HTMLDivElement>(null)
  const { push } = useRouter()
  useLayoutHeight(mainNavRef, 'mainNav')
  const { connectState, lib: curve } = useConnection<CurveApi>()

  const getNetworkConfigFromApi = useStore((state) => state.getNetworkConfigFromApi)
  const chainId = curve?.chainId
  const networks = useStore((state) => state.networks.networks)
  const visibleNetworksList = useStore((state) => state.networks.visibleNetworksList)
  const bannerHeight = useStore((state) => state.layoutHeight.globalAlert)

  const { data: tvlTotal } = useAppStatsTvl({ chainId })
  const { data: volumeTotal } = useAppStatsVolume({ chainId })

  const { rChainId, rNetwork } = useNetworkFromUrl()
  const { hasRouter } = getNetworkConfigFromApi(rChainId)
  const routerCached = useStore((state) => state.storeCache.routerFormValues[rChainId])

  const network = networks[rChainId]
  const restPartialPathname = useRestPartialPathname()

  return (
    <NewHeader<ChainId>
      networkName={rNetwork}
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
      ChainProps={{
        options: visibleNetworksList,
        disabled: isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK),
        chainId: rChainId,
        onChange: useCallback(
          (selectedChainId: ChainId) => {
            if (rChainId !== selectedChainId) {
              push(getPath({ network: networks[selectedChainId as ChainId].id }, `/${restPartialPathname}`))
            }
          },
          [rChainId, networks, push, restPartialPathname],
        ),
      }}
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
      BannerProps={BannerProps}
    />
  )
}

function _createSwapPath(routerDefault: Record<string, string>, routerCached: SwapFormValuesCache) {
  const from = routerCached?.fromAddress ?? routerDefault?.fromAddress
  const to = routerCached?.toAddress ?? routerDefault?.toAddress
  return `${ROUTE.PAGE_SWAP}/${from || to ? `?${new URLSearchParams({ ...(from && { from }), ...(to && { to }) })}` : ''}`
}

export default Header
