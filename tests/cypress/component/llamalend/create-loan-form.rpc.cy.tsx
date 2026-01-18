import { useMemo } from 'react'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { prefetchMarkets } from '@/lend/entities/chain/chain-query'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import type { OnCreateLoanFormUpdate } from '@/llamalend/features/borrow/types'
import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { CreateLoanOptions } from '@/llamalend/mutations/create-loan.mutation'
import { networks } from '@/loan/networks'
import { oneBool, oneValueOf } from '@cy/support/generators'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import {
  checkLoanDetailsLoaded,
  checkLoanRangeSlider,
  oneLoanTestMarket,
  submitCreateLoanForm,
  writeCreateLoanForm,
} from '@cy/support/helpers/create-loan.helpers'
import { createTenderlyWagmiConfigFromVNet, createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import { fundErc20, fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { useCurve } from '@ui-kit/features/connect-wallet/lib/CurveContext'
import { CurveProvider } from '@ui-kit/features/connect-wallet/lib/CurveProvider'
import { LlamaMarketType } from '@ui-kit/types/market'

const oneEthInWei = '0xde0b6b3a7640000' // 1 ETH=1e18 wei

const onUpdate: OnCreateLoanFormUpdate = async (form) => console.info('form updated', form)

type BorrowTabTestProps = Pick<CreateLoanOptions, 'onCreated'>

const prefetch = () => prefetchMarkets({})

describe('CreateLoanForm Component Tests', () => {
  const privateKey = generatePrivateKey()
  const { address } = privateKeyToAccount(privateKey)
  const getVirtualNetwork = createVirtualTestnet((uuid) => ({
    slug: `borrow-tab-${uuid}`,
    display_name: `BorrowTab (${uuid})`,
    // calldata is created by Odos, which uses the real mainnet state. Fork isn't fully synced, but the chance of reverts is smaller this way
    fork_config: { block_number: 'latest' },
  }))

  const marketType = oneValueOf(LlamaMarketType)
  const { id, collateralAddress: tokenAddress, collateral, borrow, chainId } = oneLoanTestMarket(marketType)
  const leverageEnabled = oneBool() // test with and without leverage

  function BorrowTabTest({ onCreated }: BorrowTabTestProps) {
    const { isHydrated } = useCurve()
    const market = useMemo(() => isHydrated && getLlamaMarket(id), [isHydrated])
    return market ? (
      <CreateLoanForm market={market} networks={networks} chainId={chainId} onUpdate={onUpdate} onCreated={onCreated} />
    ) : (
      <Skeleton />
    )
  }

  beforeEach(() => {
    const vnet = getVirtualNetwork()
    const { adminRpcUrl } = getRpcUrls(vnet)
    fundEth({ adminRpcUrl, amountWei: oneEthInWei, recipientAddresses: [address] })
    fundErc20({ adminRpcUrl, amountWei: oneEthInWei, tokenAddress, recipientAddresses: [address] })
    cy.log(`Funded some eth and collateral to ${address} in vnet ${vnet.slug}`)
  })

  const BorrowTabTestWrapper = (props: BorrowTabTestProps) => (
    <ComponentTestWrapper
      config={createTenderlyWagmiConfigFromVNet({ vnet: getVirtualNetwork(), privateKey })}
      autoConnect
    >
      <CurveProvider
        app="llamalend"
        network={networks[chainId]}
        onChainUnavailable={console.error}
        hydrate={{ llamalend: prefetch }}
      >
        <Box sx={{ maxWidth: 500 }}>
          <BorrowTabTest {...props} />
        </Box>
      </CurveProvider>
    </ComponentTestWrapper>
  )

  it(`calculates max debt and health for ${marketType} market ${leverageEnabled ? 'with' : 'without'} leverage`, () => {
    const onCreated = cy.stub()
    cy.mount(<BorrowTabTestWrapper onCreated={onCreated} />)
    writeCreateLoanForm({ collateral, borrow, leverageEnabled })
    checkLoanDetailsLoaded({ leverageEnabled })
    checkLoanRangeSlider(leverageEnabled)
    submitCreateLoanForm().then(() => expect(onCreated).to.be.called)
  })
})
