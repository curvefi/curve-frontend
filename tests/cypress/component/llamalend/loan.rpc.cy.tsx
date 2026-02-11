import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { prefetchMarkets } from '@/lend/entities/chain/chain-query'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import type { OnCreateLoanFormUpdate } from '@/llamalend/features/borrow/types'
import { BorrowMoreForm } from '@/llamalend/features/manage-loan/components/BorrowMoreForm'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import { ClosePositionForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ClosePositionForm'
import { ImproveHealthForm } from '@/llamalend/features/manage-soft-liquidation/ui/tabs/ImproveHealthForm'
import { getLlamaMarket } from '@/llamalend/llama.utils'
import type { NetworkDict } from '@/llamalend/llamalend.types'
import { useLoanExists } from '@/llamalend/queries/loan-exists'
import { networks as loanNetworks } from '@/loan/networks'
import type { IChainId as LlamaChainId } from '@curvefi/llamalend-api/lib/interfaces'
import {
  checkBorrowMoreDetailsLoaded,
  submitBorrowMoreForm,
  writeBorrowMoreForm,
} from '@cy/support/helpers/borrow-more.helpers'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { checkCurrentDebt, checkDebt } from '@cy/support/helpers/llamalend/action-info.helpers'
import {
  checkLoanDetailsLoaded,
  CREATE_LOAN_FUND_AMOUNT,
  LOAN_TEST_MARKETS,
  submitCreateLoanForm,
  writeCreateLoanForm,
} from '@cy/support/helpers/llamalend/create-loan.helpers'
import {
  checkRepayDetailsLoaded,
  selectRepayToken,
  submitRepayForm,
  writeRepayLoanForm,
} from '@cy/support/helpers/llamalend/repay-loan.helpers'
import {
  checkClosePositionDetailsLoaded,
  submitClosePositionForm,
  submitImproveHealthForm,
  writeImproveHealthForm,
} from '@cy/support/helpers/llamalend/soft-liquidation.helpers'
import { createTenderlyWagmiConfigFromVNet, createVirtualTestnet } from '@cy/support/helpers/tenderly'
import { getRpcUrls } from '@cy/support/helpers/tenderly/vnet'
import { fundErc20, fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import Box from '@mui/material/Box'
import Skeleton from '@mui/material/Skeleton'
import { useCurve } from '@ui-kit/features/connect-wallet/lib/CurveContext'
import { CurveProvider } from '@ui-kit/features/connect-wallet/lib/CurveProvider'
import { CRVUSD_ADDRESS, Decimal } from '@ui-kit/utils'

const networks = loanNetworks as unknown as NetworkDict<LlamaChainId>
const onUpdate: OnCreateLoanFormUpdate = async (form) => console.info('form updated', JSON.stringify(form))

const prefetch = () => prefetchMarkets({})

// const testCases = recordValues(LlamaMarketType).map((marketType) => oneLoanTestMarket(marketType))

// todo: soft liquidation should be detected not forced by passing a tab. However, that detection is in the separate apps for now.
type LoanTab = 'borrow-more' | 'repay' | 'close' | 'improve-health'

const Components = {
  'borrow-more': BorrowMoreForm,
  repay: RepayForm,
  'improve-health': ImproveHealthForm,
  close: ClosePositionForm,
}

const testCases = [LOAN_TEST_MARKETS.Mint[0]]

testCases.forEach(
  ({
    id,
    collateralAddress: tokenAddress,
    collateral,
    borrow,
    borrowMore,
    repay,
    improveHealth,
    chainId,
    hasLeverage,
    label,
  }) => {
    describe(label, () => {
      const debtAfterBorrowMore = new BigNumber(borrow).plus(borrowMore).toString() as Decimal
      const debtAfterRepay = new BigNumber(debtAfterBorrowMore).minus(repay).toString() as Decimal
      const debtAfterImproveHealth = new BigNumber(debtAfterRepay).minus(improveHealth).toString() as Decimal

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
      const debtTokenSymbol = 'crvUSD'

      let onMutated: ReturnType<typeof cy.spy>

      beforeEach(() => {
        onMutated = cy.spy().as('onMutated')
        const vnet = getVirtualNetwork()
        const { adminRpcUrl } = getRpcUrls(vnet)
        fundEth({ adminRpcUrl, amountWei: CREATE_LOAN_FUND_AMOUNT, recipientAddresses: [address] })
        fundErc20({ adminRpcUrl, amountWei: CREATE_LOAN_FUND_AMOUNT, tokenAddress, recipientAddresses: [address] })
        cy.log(`Funded some eth and collateral to ${address} in vnet ${vnet.slug}`)
      })

      function LoanFlowTest({ tab }: { tab?: LoanTab }) {
        const { isHydrated } = useCurve()
        const market = useMemo(() => isHydrated && getLlamaMarket(id), [isHydrated])

        const { data: loanExists } = useLoanExists({ chainId, marketId: id, userAddress: address })

        if (!market) return <Skeleton />
        const props = { market, networks, chainId, onUpdate, onMutated }
        const Component = loanExists ? CreateLoanForm : Components[tab!]
        return <Component {...props} />
      }

      const LoanTestWrapper = ({ tab }: { tab?: LoanTab }) => (
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
              <LoanFlowTest tab={tab} />
            </Box>
          </CurveProvider>
        </ComponentTestWrapper>
      )

      it(`creates the loan`, () => {
        cy.mount(<LoanTestWrapper />)
        writeCreateLoanForm({ collateral, borrow, leverageEnabled })
        checkLoanDetailsLoaded({ leverageEnabled })
        submitCreateLoanForm().then(() => expect(onMutated).to.be.calledOnce)
      })

      it(`borrows more`, () => {
        cy.mount(<LoanTestWrapper tab="borrow-more" />)
        writeBorrowMoreForm({ debt: borrowMore })
        checkBorrowMoreDetailsLoaded({
          expectedCurrentDebt: borrow,
          expectedFutureDebt: debtAfterBorrowMore,
          leverageEnabled,
        })
        submitBorrowMoreForm().then(() => expect(onMutated).to.be.calledOnce)
        checkCurrentDebt(debtAfterBorrowMore)
      })

      it(`repays the loan`, () => {
        cy.mount(<LoanTestWrapper tab="repay" />)
        selectRepayToken({ symbol: debtTokenSymbol, tokenAddress: CRVUSD_ADDRESS, hasLeverage })
        writeRepayLoanForm({ amount: repay })
        checkRepayDetailsLoaded({
          debt: [debtAfterBorrowMore, debtAfterRepay, debtTokenSymbol],
          leverageEnabled,
        })
        submitRepayForm().then(() => expect(onMutated).to.be.calledOnce)
        checkDebt(debtAfterRepay, debtAfterRepay, debtTokenSymbol)
      })

      it(`increases health`, () => {
        cy.mount(<LoanTestWrapper tab="improve-health" />)
        writeImproveHealthForm({ amount: repay })
        checkRepayDetailsLoaded({ debt: [debtAfterRepay, debtAfterImproveHealth, debtTokenSymbol] })
        submitImproveHealthForm().then(() => expect(onMutated).to.be.calledOnce)
        checkDebt(debtAfterImproveHealth, debtAfterImproveHealth, debtTokenSymbol)
      })

      it(`closes the loan`, () => {
        cy.mount(<LoanTestWrapper tab="close" />)
        checkClosePositionDetailsLoaded({ debt: debtAfterImproveHealth })
        submitClosePositionForm().then(() => expect(onMutated).to.be.calledOnce)
        cy.get('[data-testid="create-loan-form"]').should('be.visible')
      })
    })
  },
)
