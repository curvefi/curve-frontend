import BigNumber from 'bignumber.js'
import { useMemo } from 'react'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { prefetchMarkets } from '@/lend/entities/chain/chain-query'
import { CreateLoanForm } from '@/llamalend/features/borrow/components/CreateLoanForm'
import type { OnCreateLoanFormUpdate } from '@/llamalend/features/borrow/types'
import { BorrowMoreForm } from '@/llamalend/features/manage-loan/components/BorrowMoreForm'
import { RepayForm } from '@/llamalend/features/manage-loan/components/RepayForm'
import { getLlamaMarket } from '@/llamalend/llama.utils'
import { useLoanExists } from '@/llamalend/queries/user'
import { networks } from '@/loan/networks'
import { recordValues } from '@curvefi/prices-api/objects.util'
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
  oneLoanTestMarket,
  submitCreateLoanForm,
  writeCreateLoanForm,
} from '@cy/support/helpers/llamalend/create-loan.helpers'
import {
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
import { LlamaMarketType } from '@ui-kit/types/market'
import { CRVUSD_ADDRESS, Decimal } from '@ui-kit/utils'

const onUpdate: OnCreateLoanFormUpdate = async (form) => console.info('form updated', JSON.stringify(form))

const prefetch = () => prefetchMarkets({})

type Spy = ReturnType<typeof cy.spy>
recordValues(LlamaMarketType)
  .map((marketType) => oneLoanTestMarket(marketType))
  .forEach(
    ({ id, collateralAddress: tokenAddress, collateral, borrow, borrowMore, repay, chainId, hasLeverage, label }) => {
      describe(label, () => {
        type LoanTab = 'borrow-more' | 'repay'
        const debtAfterBorrowMore = new BigNumber(borrow).plus(borrowMore).toString() as Decimal
        const debtAfterBorrowMoreAndRepay = new BigNumber(debtAfterBorrowMore).minus(repay).toString() as Decimal

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
        let onBorrowedMore: Spy
        let onRepaid: Spy

        beforeEach(() => {
          onCreated = cy.spy().as('onCreated')
          onBorrowedMore = cy.spy().as('onBorrowedMore')
          onRepaid = cy.spy().as('onRepaid')
          const vnet = getVirtualNetwork()
          const { adminRpcUrl } = getRpcUrls(vnet)
          fundEth({ adminRpcUrl, amountWei: CREATE_LOAN_FUND_AMOUNT, recipientAddresses: [address] })
          fundErc20({ adminRpcUrl, amountWei: CREATE_LOAN_FUND_AMOUNT, tokenAddress, recipientAddresses: [address] })
          cy.log(`Funded some eth and collateral to ${address} in vnet ${vnet.slug}`)
        })

        function LoanFlowTest({ tab = 'repay' }: { tab?: LoanTab }) {
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
          ) : tab === 'borrow-more' ? (
            <BorrowMoreForm
              market={market}
              networks={networks}
              chainId={chainId}
              enabled
              onBorrowedMore={onBorrowedMore}
            />
          ) : (
            <RepayForm market={market} networks={networks} chainId={chainId} enabled onRepaid={onRepaid} />
          )
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
          submitCreateLoanForm().then(() => expect(onCreated).to.be.calledOnce)
        })

        it(`borrows more`, () => {
          cy.mount(<LoanTestWrapper tab="borrow-more" />)
          writeBorrowMoreForm({ debt: borrowMore })
          checkBorrowMoreDetailsLoaded({
            expectedCurrentDebt: borrow,
            expectedFutureDebt: debtAfterBorrowMore,
            leverageEnabled,
          })
          submitBorrowMoreForm().then(() => expect(onBorrowedMore).to.be.calledOnce)
          checkCurrentDebt(debtAfterBorrowMore)
        })

        it(`repays the loan`, () => {
          cy.mount(<LoanTestWrapper tab="repay" />)
          selectRepayToken({ symbol: 'crvUSD', tokenAddress: CRVUSD_ADDRESS, hasLeverage })
          writeRepayLoanForm({ amount: repay }) // TODO: test full-repay
          checkRepayDetailsLoaded({
            debt: [debtAfterBorrowMore, debtAfterBorrowMoreAndRepay, 'crvUSD'],
            leverageEnabled,
          })
          submitRepayForm().then(() => expect(onRepaid).to.be.calledOnce)
          checkDebt(debtAfterBorrowMoreAndRepay, debtAfterBorrowMoreAndRepay, 'crvUSD')
        })
      })
    },
  )
