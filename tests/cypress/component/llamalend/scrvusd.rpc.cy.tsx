import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { ScrvUsdDepositForm } from '@/loan/components/PageCrvUsdStaking/ScrvUsdDepositForm'
import { ScrvUsdWithdrawForm } from '@/loan/components/PageCrvUsdStaking/ScrvUsdWithdrawForm'
import { UserPosition } from '@/loan/components/PageCrvUsdStaking/UserPosition'
import { networks } from '@/loan/networks'
import { oneBool, oneDecimal } from '@cy/support/generators'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import {
  checkScrvUsdDepositDetailsLoaded,
  checkScrvUsdDepositAllowance,
  checkScrvUsdPositionDetails,
  checkScrvUsdWithdrawBalanceGreaterThan,
  checkScrvUsdWithdrawBalanceDecreasedBy,
  checkScrvUsdWithdrawBalanceLessThan,
  checkScrvUsdWithdrawBalanceZero,
  checkScrvUsdWithdrawDetailsLoaded,
  readScrvUsdWithdrawBalance,
  selectMaxScrvUsdWithdraw,
  setScrvUsdInfiniteAllowance,
  submitScrvUsdDepositForm,
  submitScrvUsdWithdrawForm,
  writeInvalidThenValidScrvUsdDeposit,
  writeInvalidThenValidScrvUsdWithdraw,
} from '@cy/support/helpers/llamalend/scrvusd.helpers'
import { fundUserWithCrvUsd } from '@cy/support/helpers/llamalend/supply/supply-setup.helpers'
import { createVirtualTestnet, createTenderlyWagmiConfigFromVNet } from '@cy/support/helpers/tenderly'
import { getRpcUrls, type TenderlyWagmiConfigFromVNet } from '@cy/support/helpers/tenderly/vnet'
import { skipTestsAfterFailure } from '@cy/support/ui'
import Stack from '@mui/material/Stack'
import type { Decimal } from '@primitives/decimal.utils'
import { CurveProvider } from '@ui-kit/features/connect-wallet/lib/CurveProvider'
import { Chain, decimalGreaterThan, decimalMultiply, decimalSum } from '@ui-kit/utils'
import { FormPlacementProvider } from '@ui-kit/widgets/DetailPageLayout/form-context/FormPlacementProvider'

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
  const approveInfinite = oneBool()

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
          <FormPlacementProvider placement="inline">
            <Stack sx={{ maxWidth: 520, gap: 2 }}>
              <UserPosition chainId={Chain.Ethereum} />
              <FormComponent network={SCRVUSD_NETWORK} />
            </Stack>
          </FormPlacementProvider>
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
    checkScrvUsdPositionDetails('zero')
    writeInvalidThenValidScrvUsdDeposit({ invalidAmount: invalidDepositValue, validAmount: depositValue })
    checkScrvUsdDepositDetailsLoaded()
    setScrvUsdInfiniteAllowance(approveInfinite)
    submitScrvUsdDepositForm()
    checkScrvUsdDepositAllowance({
      approveInfinite,
      publicRpcUrl: getRpcUrls(vnet).publicRpcUrl,
      userAddress: address,
      depositAmount: depositValue,
    })
  })

  it('partially withdraws scrvUSD', () => {
    const vnet = getVirtualNetwork()
    cy.mount(<ScrvUsdTestCase form="withdraw" vnet={vnet} />)
    checkScrvUsdPositionDetails('positive')
    readScrvUsdWithdrawBalance().then(balance => {
      expect(decimalGreaterThan(balance, '0')).to.equal(true)
      const withdrawValue = decimalMultiply(balance, oneDecimal(0.01, 0.99, 6))
      const invalidWithdrawValue = decimalSum(balance, '1')

      writeInvalidThenValidScrvUsdWithdraw({ invalidAmount: invalidWithdrawValue, validAmount: withdrawValue })
      checkScrvUsdWithdrawDetailsLoaded()
      submitScrvUsdWithdrawForm('Withdraw')
      checkScrvUsdWithdrawBalanceDecreasedBy(balance, withdrawValue)
      checkScrvUsdWithdrawBalanceGreaterThan('0')
      checkScrvUsdWithdrawBalanceLessThan(balance)
    })
  })

  it('redeems the remaining scrvUSD balance', () => {
    const vnet = getVirtualNetwork()
    cy.mount(<ScrvUsdTestCase form="withdraw" vnet={vnet} />)
    checkScrvUsdPositionDetails('positive')
    selectMaxScrvUsdWithdraw()
    checkScrvUsdWithdrawDetailsLoaded()
    submitScrvUsdWithdrawForm('Redeem')
    checkScrvUsdWithdrawBalanceZero()
  })
})
