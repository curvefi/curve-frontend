import { useCallback, useMemo, useRef } from 'react'
import { t } from '@ui-kit/lib/i18n'
import { CONNECT_STAGE, CRVUSD_ADDRESS } from '@/loan/constants'
import { getPath, getRestFullPathname, parseNetworkFromUrl } from '@/loan/utils/utilsRouter'
import { _parseRouteAndIsActive, formatNumber, isLoading } from '@ui/utils'
import { getWalletSignerAddress, useWallet } from '@ui-kit/features/connect-wallet'
import { visibleNetworksList } from '@/loan/networks'
import useLayoutHeight from '@/loan/hooks/useLayoutHeight'
import useStore from '@/loan/store/useStore'
import { Header as NewHeader, useHeaderHeight } from '@ui-kit/widgets/Header'
import { NavigationSection } from '@ui-kit/widgets/Header/types'
import { APP_LINK } from '@ui-kit/shared/routes'
import { GlobalBannerProps } from '@ui/Banner/GlobalBanner'
import { ChainId, CollateralDatasMapper, LoanDetailsMapper, type UrlParams, UsdRate } from '@/loan/types/loan.types'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { useAppStatsDailyVolume } from '@/loan/entities/appstats-daily-volume'
import { useAppStatsTotalCrvusdSupply } from '@/loan/entities/appstats-total-crvusd-supply'

type HeaderProps = { sections: NavigationSection[]; BannerProps: GlobalBannerProps }

export const Header = ({ sections, BannerProps }: HeaderProps) => {
  const params = useParams() as UrlParams
  const { wallet } = useWallet()
  const mainNavRef = useRef<HTMLDivElement>(null)
  const { push } = useRouter()
  useLayoutHeight(mainNavRef, 'mainNav')

  const { rChainId, rNetwork } = parseNetworkFromUrl(params)
  const curve = useStore((state) => state.curve)
  const chainId = curve?.chainId
  const connectState = useStore((state) => state.connectState)
  const collateralDatasMapper = useStore((state) => state.collaterals.collateralDatasMapper[rChainId])
  const crvusdPrice = useStore((state) => state.usdRates.tokens[CRVUSD_ADDRESS])
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const loansDetailsMapper = useStore((state) => state.loans.detailsMapper)
  const usdRatesMapper = useStore((state) => state.usdRates.tokens)
  const updateConnectState = useStore((state) => state.updateConnectState)
  const bannerHeight = useStore((state) => state.layout.height.globalAlert)

  const { data: dailyVolume } = useAppStatsDailyVolume({})
  const { data: crvusdTotalSupply } = useAppStatsTotalCrvusdSupply({ chainId })

  const { network: routerNetwork = 'ethereum' } = params
  const routerPathname = usePathname()

  return (
    <NewHeader<ChainId>
      networkName={rNetwork}
      mainNavRef={mainNavRef}
      isMdUp={isMdUp}
      currentApp="crvusd"
      pages={useMemo(
        () => _parseRouteAndIsActive(APP_LINK.crvusd.pages, routerPathname, routerNetwork),
        [routerNetwork, routerPathname],
      )}
      ChainProps={{
        options: visibleNetworksList,
        disabled: isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK),
        chainId: rChainId,
        onChange: useCallback(
          (selectedChainId: ChainId) => {
            if (rChainId !== selectedChainId) {
              push(getPath(params, getRestFullPathname(params)))
              updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [rChainId, selectedChainId])
            }
          },
          [rChainId, push, updateConnectState, params],
        ),
      }}
      WalletProps={{
        onConnectWallet: useCallback(
          () => updateConnectState('loading', CONNECT_STAGE.CONNECT_WALLET, ['']),
          [updateConnectState],
        ),
        onDisconnectWallet: useCallback(
          () => updateConnectState('loading', CONNECT_STAGE.DISCONNECT_WALLET),
          [updateConnectState],
        ),
        walletAddress: getWalletSignerAddress(wallet),
        disabled: isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK),
        label: t`Connect Wallet`,
      }}
      appStats={[
        {
          label: 'TVL',
          value: useMemo(
            () => _getTvl(collateralDatasMapper, loansDetailsMapper, usdRatesMapper),
            [collateralDatasMapper, loansDetailsMapper, usdRatesMapper],
          ),
        },
        {
          label: t`Daily volume`,
          value: formatNumber(dailyVolume, { currency: 'USD', notation: 'compact' }),
        },
        {
          label: t`Total Supply`,
          value: formatNumber(crvusdTotalSupply?.total, { currency: 'USD', notation: 'compact' }),
        },
        { label: 'crvUSD', value: formatNumber(crvusdPrice) || '' },
      ]}
      BannerProps={BannerProps}
      height={useHeaderHeight(bannerHeight)}
      sections={sections}
    />
  )
}

function _getTvl(
  collateralDatasMapper: CollateralDatasMapper | undefined,
  loansDetailsMapper: LoanDetailsMapper | undefined,
  usdRatesMapper: UsdRate | undefined,
) {
  let formattedTvl = '-'
  let sum = 0
  if (
    collateralDatasMapper &&
    loansDetailsMapper &&
    usdRatesMapper &&
    Object.keys(collateralDatasMapper).length > 0 &&
    Object.keys(loansDetailsMapper).length > 0 &&
    Object.keys(usdRatesMapper).length > 0
  ) {
    Object.keys(collateralDatasMapper).forEach((key) => {
      const collateralData = collateralDatasMapper[key]

      if (collateralData) {
        const { totalCollateral, totalStablecoin } = loansDetailsMapper[key]
        const usdRate = usdRatesMapper[collateralData.llamma.collateral]

        if (usdRate === 'NaN') {
          formattedTvl = '?'
        } else {
          const totalCollateralUsd = +(totalCollateral ?? '0') * +(usdRate ?? '0')
          const totalCollateralValue = totalCollateralUsd + +(totalStablecoin ?? '0')
          sum += totalCollateralValue
        }
      }
    })

    if (+sum > 0) {
      formattedTvl = formatNumber(sum, { currency: 'USD', notation: 'compact' })
    }
  }
  return formattedTvl
}

export default Header
