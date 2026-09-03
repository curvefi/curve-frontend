import { useChainId, useConnection } from 'wagmi'
import { DEPRECATED_CHAINS, isFailure, useCurve, useSwitchChain } from '@evm-ui/features/connect-wallet'
import { DOWNGRADED_CHAINS, getChainName } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { BackendMaintenanceBanner } from '@evm-ui/features/maintenance/components/BackendMaintenanceBanner'
import type { Maintenance } from '@evm-ui/features/maintenance/hooks/useMaintenance'
import { usePathname } from '@evm-ui/hooks/router'
import { useCurrentDate } from '@evm-ui/hooks/useCurrentDate'
import {
  useDismissAaveBanner,
  useDismissCurveLiteBanner,
  useDismissFantomRetirementBanner,
  useDismissMoonbeamMigrationBanner,
  useReleaseChannel,
} from '@evm-ui/hooks/useLocalStorage'
import { t } from '@evm-ui/lib/i18n'
import { getCurrentApp } from '@evm-ui/shared/routes'
import { Banner } from '@evm-ui/shared/ui/Banner'
import { Chain } from '@evm-ui/utils/network'
import { PhishingWarningBanner } from '@evm-ui/widgets/Header/PhishingWarningBanner'
import { formatDate } from '@legacy-ui/utils'
import { IS_CYPRESS, ReleaseChannel } from '@ui/utils/env'
import { StackBanners } from './StackBanners'

type GlobalBannerProps = {
  blockchainId: string
  chainId: number
  backendMaintenance: Maintenance
}

export const GlobalBanner = ({ blockchainId, chainId, backendMaintenance }: GlobalBannerProps) => {
  const [releaseChannel, setReleaseChannel] = useReleaseChannel()
  const { isConnected } = useConnection()
  const { connectState } = useCurve()
  const switchChain = useSwitchChain()
  const walletChainId = useChainId()
  const pathname = usePathname()
  const currentApp = getCurrentApp(pathname)
  const deprecationDate = DEPRECATED_CHAINS[chainId]
  const isDowngraded = DOWNGRADED_CHAINS.has(chainId)
  const currentDate = useCurrentDate()

  const [showAaveBanner, dismissAaveBanner] = useDismissAaveBanner()
  const [showFantomRetirementBanner, dismissFantomRetirementBanner] = useDismissFantomRetirementBanner()
  const [showMoonbeamMigrationBanner, dismissMoonbeamMigrationBanner] = useDismissMoonbeamMigrationBanner()
  const [showDowngraded, dismissDowngraded] = useDismissCurveLiteBanner(chainId)

  return (
    <StackBanners>
      {releaseChannel !== ReleaseChannel.Stable && !IS_CYPRESS && (
        <Banner
          icon="llama"
          onClick={() => setReleaseChannel(ReleaseChannel.Stable)}
          buttonText={t`Disable ${releaseChannel} Mode`}
        >
          {t`${releaseChannel} Mode Enabled`}
        </Banner>
      )}
      {backendMaintenance.showBanner && !IS_CYPRESS && <BackendMaintenanceBanner {...backendMaintenance} />}
      <PhishingWarningBanner />
      {isFailure(connectState) ? (
        <Banner severity="alert">
          {t`There is an issue connecting to the API. Please try to switch your RPC in your wallet settings.`}
        </Banner>
      ) : (
        isConnected &&
        chainId &&
        walletChainId != chainId && (
          <Banner severity="warning" buttonText={t`Change network`} onClick={() => void switchChain({ chainId })}>
            {t`Please switch your wallet's network to`} <strong>{blockchainId}</strong> {t`to use Curve on`}{' '}
            <strong>{blockchainId}</strong>.{' '}
          </Banner>
        )
      )}
      {deprecationDate ? (
        <Banner severity="alert">
          {`“${getChainName(chainId)}”` +
            (deprecationDate > currentDate
              ? t` will be deprecated at ${formatDate(deprecationDate)}. `
              : t` is deprecated. `)}
          {t`Future management of positions will only be possible via the chain explorer. `}
          {t`Manage your positions accordingly. `}
        </Banner>
      ) : (
        showDowngraded &&
        isDowngraded && (
          <Banner
            severity="info"
            subtitle={t`Advanced metrics won’t be available anymore, but all functions remain available. `}
            onClick={dismissDowngraded}
          >
            {`“${getChainName(chainId)}”` + t` has been moved to curve-lite due to low activity. `}
          </Banner>
        )
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
      {showMoonbeamMigrationBanner && chainId === +Chain.Moonbeam && (
        <Banner
          severity="alert"
          subtitle={t`Withdraw your assets from Curve before July 31, 2026. Funds left in Moonbeam protocols may become inaccessible when the chain winds down.`}
          onClick={dismissMoonbeamMigrationBanner}
          learnMoreUrl="https://x.com/MoonbeamNetwork/status/2073046476557623592"
        >
          {t`Moonbeam GLMR Migration`}
        </Banner>
      )}
    </StackBanners>
  )
}
