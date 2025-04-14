import { ethers } from 'ethers'
import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react'
import { getWalletChainId, getWalletSignerAddress, useSetChain, useWallet } from '@ui-kit/features/connect-wallet'
import { WalletNameStorageKey } from '@ui-kit/features/connect-wallet/lib/hooks'
import { getFromLocalStorage, setLocalStorage } from '@ui-kit/hooks/useLocalStorage'
import { t } from '@ui-kit/lib/i18n'
import { REFRESH_INTERVAL } from '@ui-kit/lib/model'
import type { WalletState as Wallet } from '@web3-onboard/core'

export type ConnectState = {
  status: 'loading' | 'success' | 'failure' | ''
  stage: 'api' | 'connect-wallet' | 'switch-network' | 'disconnect-wallet' | 'hydrate' | ''
}

export const CONNECT_STAGE = {
  CONNECT_API: 'api',
  HYDRATE: 'hydrate',
  CONNECT_WALLET: 'connect-wallet',
  DISCONNECT_WALLET: 'disconnect-wallet',
  SWITCH_NETWORK: 'switch-network',
} as const

export const isSuccess = (connectState: ConnectState) => connectState.status === 'success'

export const isFailure = ({ stage: connectionStage, status }: ConnectState, stage?: string) =>
  stage ? status === 'failure' && connectionStage.startsWith(stage) : status === 'failure'

export const isLoading = (connectState: ConnectState, stage?: string | string[]) => connectState.status === 'loading'

type ConnectionContextValue<TLib> = {
  connectState: ConnectState
  lib: TLib | null
}

const ConnectionContext = createContext<ConnectionContextValue<unknown>>({
  connectState: { status: '', stage: '' },
  lib: null,
})

const timeout = (message: string = t`Timeout connecting wallet`) =>
  new Promise<never>((_, reject) => setTimeout(() => reject(new Error(message)), REFRESH_INTERVAL['3s']))

// todo: this should be merged with apiStore and/or useWallet
export const ConnectionProvider = <
  TChainId extends number,
  TLib extends { chainId: TChainId; signerAddress?: string },
>({
  hydrate,
  initLib,
  chainId,
  onChainUnavailable,
  children,
}: {
  hydrate: (newLib: TLib, prevLib: TLib | null, wallet: Wallet | null) => Promise<void>
  initLib: (chainId: TChainId, wallet: Wallet | null) => Promise<TLib>
  chainId: TChainId
  onChainUnavailable: ([unsupportedChainId, walletChainId]: [TChainId, TChainId]) => void
  children: ReactNode
}) => {
  const [connectState, setConnectState] = useState<ConnectState>({ status: 'loading', stage: '' })
  const lib = useRef<TLib | null>(null)
  const { wallet, connect } = useWallet()
  const [_, setChain] = useSetChain()

  const walletRef = useRef(wallet) // use ref to avoid re-rendering on wallet change
  walletRef.current = wallet

  const walletChainId = getWalletChainId(wallet)
  const walletSignerAddress = getWalletSignerAddress(wallet)
  const walletLabel = wallet?.label

  useEffect(() => {
    const walletName = getFromLocalStorage<string>(WalletNameStorageKey) // todo: we might not need the walletName at all in useWallet

    const connectWalletStage = async () => {
      let wallet = walletRef.current
      if (walletLabel != walletName) {
        console.log('wallet name different', walletLabel, walletName)
        const connectPromise = connect({
          ...(walletName && {
            autoSelect: {
              label: walletName,
              disableModals: true,
            },
          }),
        })
        ;[wallet] = await Promise.race([connectPromise, timeout()])
        setLocalStorage(WalletNameStorageKey, wallet?.label ?? null)
      }
      return wallet
    }

    const initApp = async () => {
      try {
        setConnectState({ status: 'loading', stage: CONNECT_STAGE.CONNECT_WALLET })
        const wallet = await connectWalletStage()

        if (walletChainId && walletChainId !== chainId) {
          setConnectState({ status: 'loading', stage: CONNECT_STAGE.SWITCH_NETWORK })
          if (!(await setChain({ chainId: ethers.toQuantity(chainId) }))) {
            setConnectState({ status: 'failure', stage: CONNECT_STAGE.SWITCH_NETWORK })
            onChainUnavailable([chainId, walletChainId as TChainId])
          }
        }

        const prevLib = lib.current
        if (!lib.current || walletSignerAddress != prevLib?.signerAddress) {
          setConnectState({ status: 'loading', stage: CONNECT_STAGE.CONNECT_API })
          lib.current = await initLib(chainId, wallet)
        }

        setConnectState({ status: 'success', stage: CONNECT_STAGE.HYDRATE })
        await hydrate(lib.current, prevLib, wallet)

        setConnectState({ status: 'success', stage: '' })
      } catch (error) {
        console.error(error)
        setConnectState(({ stage }) => ({ status: 'failure', stage }))
      }
    }
    initApp().catch(console.error)
  }, [
    chainId,
    connect,
    hydrate,
    initLib,
    onChainUnavailable,
    walletChainId,
    walletLabel,
    walletSignerAddress,
    setChain,
  ])

  useEffect(() => {
    console.log('connectState', connectState)
  }, [connectState])
  useEffect(() => {
    console.log({ wallet })
  }, [wallet])

  return <ConnectionContext.Provider value={{ connectState, lib }}>{children}</ConnectionContext.Provider>
}

export const useConnection = <TLib extends unknown>() => useContext(ConnectionContext) as ConnectionContextValue<TLib>
