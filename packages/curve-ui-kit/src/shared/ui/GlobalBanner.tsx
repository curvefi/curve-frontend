import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import Box from '@mui/material/Box'
import { useTheme } from '@mui/material/styles'
import { isFailure, useConnection, type WagmiChainId } from '@ui-kit/features/connect-wallet'
import useUserProfileStore from '@ui-kit/features/user-profile/store'
import { t } from '@ui-kit/lib/i18n'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { Banner } from '@ui-kit/shared/ui/Banner'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { isCypress } from '@ui-kit/utils'

export type GlobalBannerProps = {
  networkId: string
  chainId: number
}

const { IconSize } = SizesAndSpaces

// Update `NEXT_PUBLIC_MAINTENANCE_MESSAGE` environment variable value to display a global message in app.
const maintenanceMessage = process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE

export const GlobalBanner = ({ networkId, chainId }: GlobalBannerProps) => {
  const isBeta = useUserProfileStore((state) => state.beta)
  const setIsBeta = useUserProfileStore((state) => state.setBeta)
  const showBetaBanner = isBeta && !isCypress

  const { isConnected } = useAccount()
  const { switchChain } = useSwitchChain()
  const { connectState } = useConnection()
  const walletChainId = useChainId()
  const showSwitchNetworkMessage = isConnected && chainId && walletChainId != chainId
  const showConnectApiErrorMessage = !showSwitchNetworkMessage && isFailure(connectState)

  const warnColor = useTheme().palette.mode === 'dark' ? '#000' : 'textSecondary' // todo: fix this in the design system of the alert component
  return (
    <Box>
      {showBetaBanner && (
        // ignore hydration warning because isBeta comes from localStorage and is not available on the server side
        <Banner onClick={() => setIsBeta(false)} buttonText={t`Disable Beta Mode`}>
          <LlamaIcon sx={{ width: IconSize.sm, height: IconSize.sm }} /> {t`BETA MODE ENABLED`}
        </Banner>
      )}
      {maintenanceMessage && (
        <Banner severity="warning" color={warnColor}>
          {maintenanceMessage}
        </Banner>
      )}
      {showSwitchNetworkMessage && (
        <Banner
          severity="warning"
          color={warnColor}
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
}
