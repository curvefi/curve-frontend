import { useMemo, useState } from 'react'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { prefetchMarkets } from '@/lend/entities/chain/chain-query'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import type { OnCreateLoanFormUpdate } from '@/llamalend/features/borrow/types'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { RepayOptions } from '@/llamalend/mutations/repay.mutation'
import networks from '@/loan/networks'
import { oneValueOf } from '@cy/support/generators'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { checkLoanDetailsLoaded, oneLoanTestMarket, writeCreateLoanForm } from '@cy/support/helpers/create-loan.helpers'
import {
  checkRepayDetailsLoaded,
  selectRepayToken,
  submitRepayForm,
  writeRepayLoanForm,
} from '@cy/support/helpers/repay-loan.helpers'
import { createTenderlyWagmiConfigFromVNet, createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import { fundErc20, fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { useCurve } from '@ui-kit/features/connect-wallet/lib/CurveContext'
import { CurveProvider } from '@ui-kit/features/connect-wallet/lib/CurveProvider'
import { LlamaMarketType } from '@ui-kit/types/market'

const oneEthInWei = '0xde0b6b3a7640000' // 1 ETH=1e18 wei

const onUpdate: OnCreateLoanFormUpdate = async (form) => console.info('form updated', form)

type RepayFlowTestProps = Pick<RepayOptions, 'onRepaid'>

const prefetch = () => prefetchMarkets({})

describe('RepayForm Component Tests', () => {
  const privateKey = generatePrivateKey()
  const { address } = privateKeyToAccount(privateKey)
  const getVirtualNetwork = createVirtualTestnet((uuid) => ({
    slug: `repay-form-${uuid}`,
    display_name: `RepayForm (${uuid})`,
    fork_config: { block_number: 'latest' },
  }))

  const marketType = oneValueOf(LlamaMarketType)
  const { id, collateralAddress: tokenAddress, collateral, borrow, chainId } = oneLoanTestMarket(marketType)

  beforeEach(() => {
    const vnet = getVirtualNetwork()
    const { adminRpcUrl } = getRpcUrls(vnet)
    fundEth({ adminRpcUrl, amountWei: oneEthInWei, recipientAddresses: [address] })
    fundErc20({ adminRpcUrl, amountWei: oneEthInWei, tokenAddress, recipientAddresses: [address] })
    cy.log(`Funded some eth and collateral to ${address} in vnet ${vnet.slug}`)
  })

  function RepayFlowTest({ onRepaid }: RepayFlowTestProps) {
    const { isHydrated } = useCurve()
    const [mode, setMode] = useState<'create' | 'repay'>('create')
    const market = useMemo(() => isHydrated && getLlamaMarket(id), [isHydrated])

    if (!market) {
      return <Skeleton />
    }
    return mode === 'create' ? (
      <CreateLoanForm
        market={market}
        networks={networks}
        chainId={chainId}
        onUpdate={onUpdate}
        onCreated={() => setMode('repay')}
      />
    ) : (
      <RepayForm market={market} networks={networks} chainId={chainId} enabled onRepaid={onRepaid} />
    )
  }

  const RepayFlowTestWrapper = (props: Omit<RepayFlowTestProps, 'marketId' | 'chainId'>) => (
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
        <Box sx={{ maxWidth: 520 }}>
          <RepayFlowTest {...props} />
        </Box>
      </CurveProvider>
    </ComponentTestWrapper>
  )

  it(`repays a ${marketType} market loan`, () => {
    const onRepaid = cy.stub()
    cy.mount(<RepayFlowTestWrapper onRepaid={onRepaid} />)
    writeCreateLoanForm({ collateral, borrow, leverageEnabled: false })
    checkLoanDetailsLoaded({ leverageEnabled: false })
    cy.get('[data-testid="create-loan-submit-button"]', LOAD_TIMEOUT).click()
    cy.get('[data-testid="repay-submit-button"]', LOAD_TIMEOUT).should('be.enabled')
    selectRepayToken('crvUSD')
    writeRepayLoanForm({ amount: '1' })
    checkRepayDetailsLoaded()
    submitRepayForm().then(() => expect(onRepaid).to.be.called)
  })
})
