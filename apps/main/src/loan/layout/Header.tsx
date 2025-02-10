import React, { useCallback, useMemo, useRef } from 'react'
import { t } from '@lingui/macro'
import { useLocation, useNavigate } from 'react-router-dom'
import { CONNECT_STAGE, CRVUSD_ADDRESS } from '@/loan/constants'
import { getNetworkFromUrl, getRestFullPathname } from '@/loan/utils/utilsRouter'
import { _parseRouteAndIsActive, formatNumber, isLoading } from '@ui/utils'
import { getWalletSignerAddress, useWallet } from '@ui-kit/features/connect-wallet'
import networks, { visibleNetworksList } from '@/loan/networks'
import useLayoutHeight from '@/loan/hooks/useLayoutHeight'
import useStore from '@/loan/store/useStore'
import { Header as NewHeader, useHeaderHeight } from '@ui-kit/widgets/Header'
import { NavigationSection } from '@ui-kit/widgets/Header/types'
import { APP_LINK } from '@ui-kit/shared/routes'
import { GlobalBannerProps } from '@ui/Banner/GlobalBanner'
import { ChainId, CollateralDatasMapper, LoanDetailsMapper, UsdRate } from '@/loan/types/loan.types'

type HeaderProps = { sections: NavigationSection[]; BannerProps: GlobalBannerProps }

export const Header = ({ sections, BannerProps }: HeaderProps) => {
  const { wallet } = useWallet()
  const mainNavRef = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  useLayoutHeight(mainNavRef, 'mainNav')

  const { rChainId, rNetwork } = getNetworkFromUrl()

  const connectState = useStore((state) => state.connectState)
  const collateralDatasMapper = useStore((state) => state.collaterals.collateralDatasMapper[rChainId])
  const crvusdPrice = useStore((state) => state.usdRates.tokens[CRVUSD_ADDRESS])
  const crvusdTotalSupply = useStore((state) => state.crvusdTotalSupply)
  const dailyVolume = useStore((state) => state.dailyVolume)
  const isMdUp = useStore((state) => state.layout.isMdUp)
  const loansDetailsMapper = useStore((state) => state.loans.detailsMapper)
  const routerProps = useStore((state) => state.routerProps)
  const usdRatesMapper = useStore((state) => state.usdRates.tokens)
  const updateConnectState = useStore((state) => state.updateConnectState)
  const bannerHeight = useStore((state) => state.layout.height.globalAlert)

  const location = useLocation()
  const { params: routerParams } = routerProps ?? {}

  const routerNetwork = routerParams?.network ?? 'ethereum'
  const routerPathname = location?.pathname ?? ''

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
              const network = networks[selectedChainId as ChainId].id
              navigate(`${network}/${getRestFullPathname()}`)
              updateConnectState('loading', CONNECT_STAGE.SWITCH_NETWORK, [rChainId, selectedChainId])
            }
          },
          [rChainId, navigate, updateConnectState],
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
