import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { ScrvUsdDepositForm } from '@/loan/components/PageCrvUsdStaking/ScrvUsdDepositForm'
import { ScrvUsdWithdrawForm } from '@/loan/components/PageCrvUsdStaking/ScrvUsdWithdrawForm'
import { networks } from '@/loan/networks'
import { oneDecimal } from '@cy/support/generators'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import {
  checkScrvUsdDepositDetailsLoaded,
  checkScrvUsdWithdrawBalanceGreaterThan,
  checkScrvUsdWithdrawBalanceLessThan,
  checkScrvUsdWithdrawBalanceZero,
  checkScrvUsdWithdrawDetailsLoaded,
  readScrvUsdWithdrawBalance,
  selectMaxScrvUsdWithdraw,
  submitScrvUsdDepositForm,
  submitScrvUsdWithdrawForm,
  writeInvalidThenValidScrvUsdDeposit,
  writeInvalidThenValidScrvUsdWithdraw,
} from '@cy/support/helpers/llamalend/scrvusd.helpers'
import { fundUserWithCrvUsd } from '@cy/support/helpers/llamalend/supply/supply-setup.helpers'
import { createVirtualTestnet, createTenderlyWagmiConfigFromVNet } from '@cy/support/helpers/tenderly'
import type { TenderlyWagmiConfigFromVNet } from '@cy/support/helpers/tenderly/vnet'
import { skipTestsAfterFailure } from '@cy/support/ui'
import Box from '@mui/material/Box'
import type { Decimal } from '@primitives/decimal.utils'
import { CurveProvider } from '@ui-kit/features/connect-wallet/lib/CurveProvider'
import { Chain, decimalGreaterThan, decimalMultiply, decimalSum } from '@ui-kit/utils'

type ScrvUsdForm = 'deposit' | 'withdraw'

const SCRVUSD_NETWORK = 'ethereum'
const ETH_FUND_AMOUNT = '1' as Decimal
const ScrvUsdFormComponents = {
  deposit: ScrvUsdDepositForm,
  withdraw: ScrvUsdWithdrawForm,
} satisfies Record<ScrvUsdForm, typeof ScrvUsdDepositForm | typeof ScrvUsdWithdrawForm>

describe('scrvUSD', () => {
  skipTestsAfterFailure()

  const privateKey = generatePrivateKey()
  const { address } = privateKeyToAccount(privateKey)
  const fundValue = oneDecimal(1, 10000, 6)
  const depositValue = decimalMultiply(fundValue, oneDecimal(0.1, 0.9, 6))
  const invalidDepositValue = decimalSum(fundValue, '1')

  const getVirtualNetwork = createVirtualTestnet(uuid => ({
    slug: `scrvusd-integration-${uuid}`,
    display_name: `ScrvUsdIntegration (${uuid})`,
    chain_id: Chain.Ethereum,
    fork_config: { block_number: 'latest' },
  }))

  const ScrvUsdTestCase = ({ form, vnet }: { form: ScrvUsdForm } & TenderlyWagmiConfigFromVNet) => {
    const FormComponent = ScrvUsdFormComponents[form]

    return (
      <ComponentTestWrapper config={createTenderlyWagmiConfigFromVNet({ vnet, privateKey })} autoConnect>
        <CurveProvider app="llamalend" network={networks[Chain.Ethereum]} onChainUnavailable={console.error}>
          <Box sx={{ maxWidth: 520 }}>
            <FormComponent network={SCRVUSD_NETWORK} />
          </Box>
        </CurveProvider>
      </ComponentTestWrapper>
    )
  }

  before(() => {
    const vnet = getVirtualNetwork()
    fundUserWithCrvUsd({
      vnet,
      userAddress: address,
      crvUsdAmount: fundValue,
      ethAmount: ETH_FUND_AMOUNT,
    })
    cy.log(`Funded ${fundValue} crvUSD and ${ETH_FUND_AMOUNT} ETH to ${address} in ${vnet.slug}`)
  })

  it('deposits crvUSD into scrvUSD', () => {
    const vnet = getVirtualNetwork()
    cy.mount(<ScrvUsdTestCase form="deposit" vnet={vnet} />)
    writeInvalidThenValidScrvUsdDeposit({ invalidAmount: invalidDepositValue, validAmount: depositValue })
    checkScrvUsdDepositDetailsLoaded()
    submitScrvUsdDepositForm()
  })

  it('partially withdraws scrvUSD', () => {
    const vnet = getVirtualNetwork()
    cy.mount(<ScrvUsdTestCase form="withdraw" vnet={vnet} />)
    readScrvUsdWithdrawBalance().then(balance => {
      expect(decimalGreaterThan(balance, '0')).to.equal(true)
      const withdrawValue = decimalMultiply(balance, oneDecimal(0.01, 0.99, 6))
      const invalidWithdrawValue = decimalSum(balance, '1')

      writeInvalidThenValidScrvUsdWithdraw({ invalidAmount: invalidWithdrawValue, validAmount: withdrawValue })
      checkScrvUsdWithdrawDetailsLoaded()
      submitScrvUsdWithdrawForm('Withdraw')
      checkScrvUsdWithdrawBalanceGreaterThan('0')
      checkScrvUsdWithdrawBalanceLessThan(balance)
    })
  })

  it('redeems the remaining scrvUSD balance', () => {
    const vnet = getVirtualNetwork()
    cy.mount(<ScrvUsdTestCase form="withdraw" vnet={vnet} />)
    selectMaxScrvUsdWithdraw()
    checkScrvUsdWithdrawDetailsLoaded()
    submitScrvUsdWithdrawForm('Redeem')
    checkScrvUsdWithdrawBalanceZero()
  })
})
