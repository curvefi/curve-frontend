import { useChainId } from 'wagmi'
import { DEPRECATED_CHAINS, isFailure, useCurve, useSwitchChain } from '@evm-ui/features/connect-wallet'
import { DOWNGRADED_CHAINS, getChainName } from '@evm-ui/features/connect-wallet/lib/wagmi/chains'
import { useDismissAaveBanner, useDismissFantomRetirementBanner } from '@evm-ui/hooks/useLocalStorage'
import { type AppName } from '@evm-ui/shared/routes'
import { Banner } from '@evm-ui/shared/ui/Banner'
import { GlobalBanner, type GlobalBannerProps } from '@evm-ui/shared/ui/GlobalBanner'
import { Chain } from '@primitives/network.utils'
import { t } from '@ui/lib/i18n'

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
  const [showFantomRetirementBanner, dismissFantomRetirementBanner] = useDismissFantomRetirementBanner()

  return (
    <GlobalBanner
      deprecationDate={DEPRECATED_CHAINS[chainId]}
      isDowngraded={DOWNGRADED_CHAINS.has(chainId)}
      connectError={isFailure(connectState) ? new Error(t`There is an issue connecting to the API.`) : undefined}
      switchChain={useSwitchChain()}
      walletChainId={useChainId()}
      chainName={getChainName(chainId)}
      {...bannerProps}
    >
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
