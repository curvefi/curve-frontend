import { forwardRef, Ref } from 'react'
import { useChainId, useSwitchChain } from 'wagmi'
import { useAccount } from 'wagmi'
import Box from '@mui/material/Box'
import { CONNECT_STAGE, isFailure, useConnection } from '@ui-kit/features/connect-wallet'
import type { WagmiChainId } from '@ui-kit/features/connect-wallet/lib/wagmi/chains'
import { useBetaFlag } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { Banner } from '@ui-kit/shared/ui/Banner'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { isCypress } from '@ui-kit/utils'

export type GlobalBannerProps = {
  networkId: string
  chainId: number
  ref: Ref<HTMLDivElement>
}

const { IconSize } = SizesAndSpaces

// Update `NEXT_PUBLIC_MAINTENANCE_MESSAGE` environment variable value to display a global message in app.
const maintenanceMessage = process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE

export const GlobalBanner = forwardRef<HTMLDivElement, Omit<GlobalBannerProps, 'ref'>>(
  ({ networkId, chainId }, ref) => {
    const [isBeta, setIsBeta] = useBetaFlag()
    const showBetaBanner = isBeta && !isCypress

    const { isConnected } = useAccount()
    const { switchChain } = useSwitchChain()
    const { connectState } = useConnection()
    const showConnectApiErrorMessage = isFailure(connectState, CONNECT_STAGE.CONNECT_API)
    const walletChainId = useChainId()
    const showSwitchNetworkMessage =
      (isConnected && walletChainId != chainId) || isFailure(connectState, CONNECT_STAGE.SWITCH_NETWORK)

    return (
      (showSwitchNetworkMessage || showConnectApiErrorMessage || maintenanceMessage || showBetaBanner) && (
        <Box ref={ref}>
          {showBetaBanner && (
            <Banner onClick={() => setIsBeta(false)} buttonText={t`Disable Beta Mode`}>
              <LlamaIcon sx={{ width: IconSize.sm, height: IconSize.sm }} /> {t`BETA MODE ENABLED`}
            </Banner>
          )}
          {maintenanceMessage && <Banner severity="warning">{maintenanceMessage}</Banner>}
          {showSwitchNetworkMessage && (
            <Banner
              severity="warning"
              buttonText={t`Change network`}
              onClick={() => switchChain({ chainId: chainId as WagmiChainId })}
            >
              {t`Please switch your wallet's network to`} <strong>{networkId}</strong> {t`to use Curve on`}{' '}
              <strong>{networkId}</strong>.{' '}
            </Banner>
          )}
          {showConnectApiErrorMessage && (
            <Banner severity="alert">
              {t`There is an issue connecting to the API. You can try switching your RPC or, if you are connected to a wallet, please switch to a different one.`}
            </Banner>
          )}
        </Box>
      )
    )
  },
)
GlobalBanner.displayName = 'GlobalBanner'
