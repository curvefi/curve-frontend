import { useParams } from 'next/navigation'
import { type RefObject, useMemo, useRef } from 'react'
import { CRVUSD_ADDRESS } from '@/loan/constants'
import { useAppStatsDailyVolume } from '@/loan/entities/appstats-daily-volume'
import { useAppStatsTotalCrvusdSupply } from '@/loan/entities/appstats-total-crvusd-supply'
import { visibleNetworksList } from '@/loan/networks'
import useStore from '@/loan/store/useStore'
import { CollateralDatasMapper, LoanDetailsMapper, type UrlParams, UsdRate } from '@/loan/types/loan.types'
import { useChainId } from '@/loan/utils/utilsRouter'
import { formatNumber } from '@ui/utils'
import { useLayoutStore } from '@ui-kit/features/layout'
import { useLayoutHeight } from '@ui-kit/hooks/useResizeObserver'
import { t } from '@ui-kit/lib/i18n'
import { APP_LINK } from '@ui-kit/shared/routes'
import { Header as NewHeader, useHeaderHeight } from '@ui-kit/widgets/Header'
import { NavigationSection } from '@ui-kit/widgets/Header/types'

type HeaderProps = {
  sections: NavigationSection[]
  globalAlertRef: RefObject<HTMLDivElement | null>
  networkId: string
}

export const Header = ({ sections, globalAlertRef, networkId }: HeaderProps) => {
  const params = useParams() as UrlParams
  const mainNavRef = useRef<HTMLDivElement>(null)
  const setLayoutHeight = useLayoutStore((state) => state.setLayoutHeight)
  useLayoutHeight(mainNavRef, 'mainNav', setLayoutHeight)

  const rChainId = useChainId(params)
  const collateralDatasMapper = useStore((state) => state.collaterals.collateralDatasMapper[rChainId])
  const crvusdPrice = useStore((state) => state.usdRates.tokens[CRVUSD_ADDRESS])
  const loansDetailsMapper = useStore((state) => state.loans.detailsMapper)
  const usdRatesMapper = useStore((state) => state.usdRates.tokens)
  const bannerHeight = useLayoutStore((state) => state.height.globalAlert)

  const { data: dailyVolume } = useAppStatsDailyVolume({})
  const { data: crvusdTotalSupply } = useAppStatsTotalCrvusdSupply({ chainId: rChainId })

  return (
    <NewHeader
      networkId={networkId}
      chainId={rChainId}
      mainNavRef={mainNavRef}
      currentMenu="llamalend"
      routes={APP_LINK.llamalend.routes}
      chains={visibleNetworksList}
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
      globalAlertRef={globalAlertRef}
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
      const loanDetails = loansDetailsMapper[key]

      if (collateralData && loanDetails) {
        const { totalCollateral, totalStablecoin } = loanDetails
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
