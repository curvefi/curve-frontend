import { type ReactNode, useCallback, useMemo, useState } from 'react'
import { connect, disconnect } from '@wagmi/core'
import { WagmiConnectModal } from '../../ui/WagmiConnectModal'
import { config, SupportedWallets } from './setup'

export const useWagmiWallet = () => {
  const [modal, setModal] = useState<ReactNode>()
  const [connecting, setConnecting] = useState(false)

  const connectWagmi = useCallback(async ({ autoSelect }: { autoSelect?: { label: string } }) => {
    if (!autoSelect) {
      return setModal(<WagmiConnectModal />)
    }

    const connector = SupportedWallets.find(w => w.label === autoSelect.label)?.connector
    if (!connector) {
      return setModal(<WagmiConnectModal />)
    }

    setConnecting(true)
    try {
      return await connect(config, { connector })
    } finally {
      setConnecting(false)
    }
  }, [])

  const disconnectWagmi = useCallback(() => disconnect(config), [])
  const wallet = useMemo(() => ({
    connector: config.connectors[0],
    accounts: [],
    chains: [],
    provider: null,
    client: null,
  }), [])

  return [{ wallet, connecting, modal }, connectWagmi, disconnectWagmi]
}
