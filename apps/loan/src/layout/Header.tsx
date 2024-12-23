import React, { useCallback, useMemo, useRef } from 'react'
import { t } from '@lingui/macro'
import { useNavigate } from 'react-router-dom'
import { CONNECT_STAGE, CRVUSD_ADDRESS } from '@/constants'
import { getLocaleFromUrl, getNetworkFromUrl, getRestFullPathname } from '@/utils/utilsRouter'
import { _parseRouteAndIsActive, formatNumber, isLoading } from '@/ui/utils'
import { getWalletSignerAddress, useConnectWallet } from '@ui-kit/features/connect-wallet'
import networks, { visibleNetworksList } from '@/networks'
import useLayoutHeight from '@/hooks/useLayoutHeight'
import useStore from '@/store/useStore'
import { Header as NewHeader } from '@ui-kit/widgets/Header'
import { NavigationSection } from '@ui-kit/widgets/Header/types'
import { ThemeKey } from 'curve-ui-kit/src/themes/basic-theme'
import { APP_LINK } from '@ui-kit/shared/routes'
import { GlobalBannerProps } from '@/ui/Banner/GlobalBanner'

type HeaderProps = { sections: NavigationSection[]; BannerProps: GlobalBannerProps }

export const Header = ({ sections, BannerProps }: HeaderProps) => {
  const [{ wallet }] = useConnectWallet()
  const mainNavRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  useLayoutHeight(mainNavRef, 'mainNav')

  const { rChainId, rNetwork } = getNetworkFromUrl()

  const connectState = useStore((state) => state.connectState)
  const collateralDatasMapper = useStore((state) => state.collaterals.collateralDatasMapper[rChainId])
  const crvusdPrice = useStore((state) => state.usdRates.tokens[CRVUSD_ADDRESS])
  const crvusdTotalSupply = useStore((state) => state.crvusdTotalSupply)
  const dailyVolume = useStore((state) => state.dailyVolume)
  const isAdvanceMode = useStore((state) => state.isAdvanceMode)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const loansDetailsMapper = useStore((state) => state.loans.detailsMapper)
  const locale = useStore((state) => state.locale)
  const routerProps = useStore((state) => state.routerProps)
  const themeType = useStore((state) => state.themeType)
  const usdRatesMapper = useStore((state) => state.usdRates.tokens)
  const setAppCache = useStore((state) => state.setAppCache)
  const updateConnectState = useStore((state) => state.updateConnectState)
  const bannerHeight = useStore((state) => state.layout.height.globalAlert)

  const { rLocalePathname } = getLocaleFromUrl()
  const { params: routerParams, location } = routerProps ?? {}

  const routerNetwork = routerParams?.network ?? 'ethereum'
  const routerPathname = location?.pathname ?? ''

  const theme = themeType == 'default' ? 'light' : (themeType as ThemeKey)
  return (
    <NewHeader<ChainId>
      networkName={rNetwork}
      mainNavRef={mainNavRef}
      locale={locale}
      isMdUp={isMdUp}
      advancedMode={[
        isAdvanceMode,
        useCallback(() => setAppCache('isAdvanceMode', !isAdvanceMode), [isAdvanceMode, setAppCache]),
      ]}
      currentApp="crvusd"
      pages={useMemo(
        () => _parseRouteAndIsActive(APP_LINK.crvusd.pages, rLocalePathname, routerPathname, routerNetwork),
        [rLocalePathname, routerNetwork, routerPathname],
      )}
      themes={[
        theme,
        useCallback(
          (selectedThemeType: ThemeKey) =>
            setAppCache('themeType', selectedThemeType == 'light' ? 'default' : selectedThemeType),
          [setAppCache],
        ),
      ]}
      ChainProps={{
        theme,
        options: visibleNetworksList,
        disabled: isLoading(connectState, CONNECT_STAGE.SWITCH_NETWORK),
        chainId: rChainId,
        onChange: useCallback(
          (selectedChainId: ChainId) => {
            if (rChainId !== selectedChainId) {
              const network = networks[selectedChainId as ChainId].id
              navigate(`${locale}/${network}/${getRestFullPathname()}`)
              updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [rChainId, selectedChainId])
            }
          },
          [rChainId, navigate, locale, updateConnectState],
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
      bannerHeight={bannerHeight}
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
