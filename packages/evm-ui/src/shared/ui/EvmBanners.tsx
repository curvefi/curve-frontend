import { useChainId } from 'wagmi'
import { DEPRECATED_CHAINS, isFailure, useCurve, useSwitchChain } from '@evm-ui/features/connect-wallet'
import { DOWNGRADED_CHAINS, getChainName } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { type AppName } from '@evm-ui/shared/routes'
import { Chain } from '@primitives/network.utils'
import { InlineLink } from '@ui/components/InlineLink'
import { Banner } from '@ui/features/banners/Banner'
import { GlobalBanner, type GlobalBannerProps } from '@ui/features/banners/GlobalBanner'
import {
  useDismissAaveBanner,
  useDismissDexDashboardRetirementBanner,
  useDismissFantomRetirementBanner,
} from '@ui/features/storage/useLocalStorage'
import { useCurrentDate } from '@ui/hooks/useCurrentDate'
import { t, Trans } from '@ui/lib/i18n'
import { EXTERNAL_LINKS } from '@ui/lib/resource.constants'

const DEX_DASHBOARD_RETIREMENT_BANNER_END = new Date('2026-12-01T00:00:00Z')

export const EvmBanners = ({
  currentApp,
  ...bannerProps
}: { currentApp: AppName } & Pick<
  GlobalBannerProps,
  'blockchainId' | 'chainId' | 'backendMaintenance' | 'isConnected'
>) => {
  const { chainId } = bannerProps
  const { connectState } = useCurve()
  const [showAaveBanner, dismissAaveBanner] = useDismissAaveBanner()
  const [showDashboardRetirementBanner, dismissDashboardRetirementBanner] = useDismissDexDashboardRetirementBanner()
  const [showFantomRetirementBanner, dismissFantomRetirementBanner] = useDismissFantomRetirementBanner()
  const currentDate = useCurrentDate()

  return (
    <GlobalBanner
      rootUrl={EXTERNAL_LINKS.curve.root}
      deprecationDate={DEPRECATED_CHAINS[chainId]}
      isDowngraded={DOWNGRADED_CHAINS.has(chainId)}
      connectError={isFailure(connectState) ? new Error(t`There is an issue connecting to the API.`) : undefined}
      switchChain={useSwitchChain()}
      walletChainId={useChainId()}
      chainName={getChainName(chainId)}
      {...bannerProps}
    >
      {showDashboardRetirementBanner && currentApp === 'dex' && currentDate < DEX_DASHBOARD_RETIREMENT_BANNER_END && (
        <Banner
          severity="info"
          subtitle={
            <Trans>
              As part of ongoing maintenance and improvements on the website, the DEX dashboard has been retired in
              favour of the user positions list on the{' '}
              <InlineLink to="https://www.curve.finance/dex/ethereum/pools">pool page</InlineLink>. Claiming veCRV fees
              can be done on the DAO app via the{' '}
              <InlineLink to="https://www.curve.finance/dao/ethereum/vecrv">lock CRV</InlineLink> page.
            </Trans>
          }
          onClick={dismissDashboardRetirementBanner}
        >
          {t`Dashboard retirement`}
        </Banner>
      )}
      {showAaveBanner && currentApp === 'dex' && [Chain.Polygon, Chain.Avalanche].includes(chainId) && (
        <Banner
          severity="info"
          subtitle={t`Aave is deprecating its V2 markets on Polygon and Avalanche. Deposits and swaps are not supported`}
          onClick={dismissAaveBanner}
          learnMoreUrl="https://governance.aave.com/t/direct-to-aip-aave-v2-non-ethereum-pools-next-deprecation-steps/22445"
        >
          {t`Aave V2 Frozen aTokens`}
        </Banner>
      )}
      {showFantomRetirementBanner && chainId === +Chain.Fantom && (
        <Banner
          severity="alert"
          subtitle={t`The Fantom chain will be retired at the end of the year. Please withdraw from pools.`}
          onClick={dismissFantomRetirementBanner}
          learnMoreUrl="https://x.com/SonicLabs/status/2041551455254097988"
        >
          {t`Fantom Retirement`}
        </Banner>
      )}
    </GlobalBanner>
  )
}
