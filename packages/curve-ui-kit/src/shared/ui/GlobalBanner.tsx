import { ethers } from 'ethers/lib.esm'
import { forwardRef, Ref } from 'react'
import Box from '@mui/material/Box'
import {
  CONNECT_STAGE,
  getWalletChainId,
  isFailure,
  useConnection,
  useSetChain,
  useWallet,
} from '@ui-kit/features/connect-wallet'
import { useLocalStorage } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { LlamaIcon } from '@ui-kit/shared/icons/LlamaIcon'
import { Banner } from '@ui-kit/shared/ui/Banner'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

export type GlobalBannerProps = {
  networkName: string
  chainId: number
  ref: Ref<HTMLDivElement>
}

const { IconSize } = SizesAndSpaces

// Update `NEXT_PUBLIC_MAINTENANCE_MESSAGE` environment variable value to display a global message in app.
const maintenanceMessage = process.env.NEXT_PUBLIC_MAINTENANCE_MESSAGE

export const GlobalBanner = forwardRef<HTMLDivElement, Omit<GlobalBannerProps, 'ref'>>(
  ({ networkName, chainId }, ref) => {
    const { wallet } = useWallet()
    const [, setWalletChain] = useSetChain()
    const { connectState } = useConnection()
    const showConnectApiErrorMessage = isFailure(connectState, CONNECT_STAGE.CONNECT_API)
    const showSwitchNetworkMessage =
      (wallet && getWalletChainId(wallet) != chainId) || isFailure(connectState, CONNECT_STAGE.SWITCH_NETWORK)
    const [isBeta, setIsBeta] = useLocalStorage<boolean>('beta')
    return (
      (showSwitchNetworkMessage || showConnectApiErrorMessage || maintenanceMessage || isBeta) && (
        <Box ref={ref}>
          {isBeta && (
            <Banner onClick={() => setIsBeta(false)} buttonText={t`Disable Beta Mode`}>
              <LlamaIcon sx={{ width: IconSize.sm, height: IconSize.sm }} /> {t`BETA MODE ENABLED`}
            </Banner>
          )}
          {maintenanceMessage && <Banner severity="warning">{maintenanceMessage}</Banner>}
          {showSwitchNetworkMessage && (
            <Banner
              severity="warning"
              buttonText={t`Change network`}
              onClick={() => setWalletChain({ chainId: ethers.toQuantity(chainId) })}
            >
              {t`Please switch your wallet's network to`} <strong>{networkName}</strong> {t`to use Curve on`}{' '}
              <strong>{networkName}</strong>.{' '}
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
