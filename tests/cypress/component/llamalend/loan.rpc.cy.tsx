import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { prefetchMarkets } from '@/lend/entities/chain/chain-query'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import type { OnCreateLoanFormUpdate } from '@/llamalend/features/borrow/types'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import { getLlamaMarket } from '@/llamalend/llama.utils'
import { useLoanExists } from '@/llamalend/queries/loan-exists'
import { networks } from '@/loan/networks'
import { recordEntries } from '@curvefi/prices-api/objects.util'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import {
  checkLoanDetailsLoaded,
  CREATE_LOAN_FUND_AMOUNT,
  LOAN_TEST_MARKETS,
  submitCreateLoanForm,
  writeCreateLoanForm,
} from '@cy/support/helpers/llamalend/create-loan.helpers'
import {
  checkDebt,
  checkRepayDetailsLoaded,
  selectRepayToken,
  submitRepayForm,
  writeRepayLoanForm,
} from '@cy/support/helpers/llamalend/repay-loan.helpers'
import { createTenderlyWagmiConfigFromVNet, createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import { fundErc20, fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { useCurve } from '@ui-kit/features/connect-wallet/lib/CurveContext'
import { CurveProvider } from '@ui-kit/features/connect-wallet/lib/CurveProvider'
import { Decimal } from '@ui-kit/utils'

const onUpdate: OnCreateLoanFormUpdate = async (form) => console.info('form updated', form)

const prefetch = () => prefetchMarkets({})

type Spy = ReturnType<typeof cy.spy>
recordEntries(LOAN_TEST_MARKETS)
  .flatMap(([marketType, markets]) => markets.map((market) => ({ marketType, ...market })))
  .forEach(({ id, collateralAddress: tokenAddress, collateral, borrow, repay, chainId, hasLeverage, label }) => {
    describe(label, () => {
      const debtAfterRepay = new BigNumber(borrow).minus(repay).toString() as Decimal

      const privateKey = generatePrivateKey()
      const { address } = privateKeyToAccount(privateKey)
      const getVirtualNetwork = createVirtualTestnet((uuid) => ({
        slug: `loan-integration-${uuid}`,
        display_name: `LoanIntegration (${uuid})`,
        fork_config: { block_number: 'latest' },
      }))

      /**
       * Leverage disabled in the tests for now because it depends on Odos routes.
       * It will soon be migrated to our own router API, so it will be easier to mock.
       */
      const leverageEnabled = hasLeverage && false

      let onCreated: Spy
      let onRepaid: Spy

      beforeEach(() => {
        onCreated = cy.spy().as('onCreated')
        onRepaid = cy.spy().as('onRepaid')
        const vnet = getVirtualNetwork()
        const { adminRpcUrl } = getRpcUrls(vnet)
        fundEth({ adminRpcUrl, amountWei: CREATE_LOAN_FUND_AMOUNT, recipientAddresses: [address] })
        fundErc20({ adminRpcUrl, amountWei: CREATE_LOAN_FUND_AMOUNT, tokenAddress, recipientAddresses: [address] })
        cy.log(`Funded some eth and collateral to ${address} in vnet ${vnet.slug}`)
      })

      function LoanFlowTest() {
        const { isHydrated } = useCurve()
        const market = useMemo(() => isHydrated && getLlamaMarket(id), [isHydrated])

        const { data: loanExists } = useLoanExists({ chainId, marketId: id, userAddress: address })

        if (!market) return <Skeleton />
        return loanExists == false ? (
          <CreateLoanForm
            market={market}
            networks={networks}
            chainId={chainId}
            onUpdate={onUpdate}
            onCreated={onCreated}
          />
        ) : (
          <RepayForm market={market} networks={networks} chainId={chainId} enabled onRepaid={onRepaid} />
        )
      }

      const LoanTestWrapper = () => (
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
              <LoanFlowTest />
            </Box>
          </CurveProvider>
        </ComponentTestWrapper>
      )

      it(`creates the loan`, () => {
        cy.mount(<LoanTestWrapper />)
        writeCreateLoanForm({ collateral, borrow, leverageEnabled })
        checkLoanDetailsLoaded({ leverageEnabled })
        submitCreateLoanForm().then(() => expect(onCreated).to.be.calledOnce)
      })

      it(`repays the loan`, () => {
        cy.mount(<LoanTestWrapper />)
        selectRepayToken('crvUSD')
        writeRepayLoanForm({ amount: repay })
        checkRepayDetailsLoaded({
          debt: [borrow, debtAfterRepay, 'crvUSD'],
          leverageEnabled,
        })
        submitRepayForm().then(() => expect(onRepaid).to.be.calledOnce)
        checkDebt(debtAfterRepay, debtAfterRepay, 'crvUSD')
      })
    })
  })
