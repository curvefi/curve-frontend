import { useEffect, useState } from 'react'
import type { IFastBridgeNetwork } from '@curvefi/api/lib/bridge'
import type { Decimal } from '@primitives/decimal.utils'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { NetworkDef } from '@ui/utils'
import { q } from '@ui-kit/types/util'
import { Chain, decimal } from '@ui-kit/utils'
import { FormContent } from '@ui-kit/widgets/DetailPageLayout/FormContent'
import { BridgeActionInfos } from './BridgeActionInfos'
import { BridgeFormContent, type BridgeFormContentParams } from './BridgeFormContent'
import { BridgeInfoAlert } from './BridgeInfoAlert'

// Copied from curve-js fastbridge docs
const SupportedNetworks: IFastBridgeNetwork[] = [
  {
    chainId: 42161,
    name: 'Arbitrum',
    fastBridgeAddress: '0x1F2aF270029d028400265Ce1dd0919BA8780dAe1',
    crvUsdAddress: '0x498Bf2B1e120FeD3ad3D42EA2165E9b73f99C1e5',
  },
  {
    chainId: 10,
    name: 'Optimism',
    fastBridgeAddress: '0xD16d5eC345Dd86Fb63C6a9C43c517210F1027914',
    crvUsdAddress: '0x417Ac0e078398C154EdFadD9Ef675d30Be60Af93',
  },
  {
    chainId: 252,
    name: 'Fraxtal',
    fastBridgeAddress: '0x3fE593E651Cd0B383AD36b75F4159f30BB0631A6',
    crvUsdAddress: '0x67bCae3700C0fd13FB1951C7801050349F8C5caa',
  },
]

// Mock networks for chain selection
const BridgeNetworks = [
  { chainId: Chain.Arbitrum, id: 'arbitrum', name: 'Arbitrum' },
  { chainId: Chain.Optimism, id: 'optimism', name: 'Optimism' },
  { chainId: Chain.Fraxtal, id: 'fraxtal', name: 'Fraxtal' },
] as NetworkDef[]

const BridgeForm = (props: BridgeFormContentParams) => {
  const [fromChainId, setFromChainId] = useState(SupportedNetworks[0].chainId)
  const [amount, setAmount] = useState<Decimal | undefined>(undefined)
  const [loading, setLoading] = useState(true)
  const [walletBalance, setWalletBalance] = useState({
    balance: '1234' as Decimal,
    loading: true,
    notionalValueUsd: 500,
  })

  // Simulate loading at start
  useEffect(() => {
    setTimeout(() => {
      setLoading(false)
      setWalletBalance({ ...walletBalance, loading: false })
    }, 2000)
  }, [walletBalance])

  // Simulate connecting
  const [isConnected, setIsConnected] = useState(props.isConnected)
  const [isConnecting, setIsConnecting] = useState(false)

  // Simulate wrong network
  const [isWrongNetwork, setIsWrongNetwork] = useState(props.isWrongNetwork)

  // Simulate approval required first
  const [isApproved, setIsApproved] = useState(props.isApproved ?? false)

  // Simulate bridge execution
  const [isPending, setIsPending] = useState(props.isPending ?? false)

  return (
    <FormContent
      footer={
        <>
          <BridgeActionInfos
            bridgeCost={q({ data: 0.69, isLoading: false, error: null })}
            gas={q({ data: { estGasCostUsd: 0.12 }, isLoading: false, error: null })}
            isApproved={isApproved}
          />
          <BridgeInfoAlert />
        </>
      }
    >
      <BridgeFormContent
        {...props}
        networks={BridgeNetworks}
        fromChainId={fromChainId}
        amount={amount}
        loading={loading}
        walletBalance={walletBalance}
        inputBalanceUsd={amount && decimal(1.02 * +amount)} // Faking 1 crvUSD = $1.02
        amountError={
          amount && +amount > +walletBalance.balance
            ? `The amount ${amount} exceeds you wallet balance ${walletBalance.balance}`
            : undefined
        }
        isPending={isPending}
        isApproved={isApproved}
        isConnected={isConnected}
        isConnecting={isConnecting}
        isWrongNetwork={isWrongNetwork}
        onSubmit={() => {
          setIsPending(true)

          if (!isApproved) {
            setTimeout(() => {
              setIsPending(false)
              setIsApproved(true)
            }, 2000)
            return
          }

          setTimeout(() => {
            setIsPending(false)
          }, 2000)
        }}
        onAmount={setAmount}
        onConnect={() => {
          setIsConnecting(true)
          setTimeout(() => {
            setIsConnecting(false)
            setIsConnected(true)
          }, 2000)
        }}
        onChangeNetwork={() => setIsWrongNetwork(false)}
        onNetworkSelected={(network) => setFromChainId(network.chainId)}
      />
    </FormContent>
  )
}

const meta: Meta<typeof BridgeFormContent> = {
  title: 'Bridge/Features/Bridge',
}

type Story = StoryObj<typeof BridgeFormContent>

export const Default: Story = {
  render: (args) => <BridgeForm {...args} />,
  parameters: { docs: { description: { story: 'Default bridge form' } } },
  args: { isConnected: true },
}

export const NotConnected: Story = {
  render: (args) => <BridgeForm {...args} />,
  parameters: { docs: { description: { story: 'No connected wallet' } } },
  args: { isConnected: false },
}

export const WrongNetwork: Story = {
  render: (args) => <BridgeForm {...args} />,
  parameters: { docs: { description: { story: 'Wallet is on the wrong network compared to from chain' } } },
  args: { isConnected: true, isWrongNetwork: true },
}

export default meta
