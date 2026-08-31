import { parseUnits } from 'viem'
import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { useNetworksQuery } from '@/dex/entities/networks'
import { AddRewardToken } from '@/dex/features/add-gauge-reward-token'
import { DepositReward } from '@/dex/features/deposit-gauge-reward'
import { defaultNetworks } from '@/dex/lib/networks'
import { useStore } from '@/dex/store/useStore'
import { Loading } from '@/routes/Loading'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import {
  addGaugeReward,
  expectErc20BalanceChange,
  expectGaugeRewardDistributor,
  getErc20Balance,
  setGaugeManager,
} from '@cy/support/helpers/dex/gauge.helpers'
import { createVirtualTestnet } from '@cy/support/helpers/tenderly'
import {
  createTenderlyWagmiConfigFromVNet,
  getRpcUrls,
  type TenderlyWagmiConfigFromVNet,
} from '@cy/support/helpers/tenderly/vnet'
import { fundErc20, fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
import { LOAD_TIMEOUT, skipTestsAfterFailure } from '@cy/support/ui'
import { CurveProvider } from '@evm-ui/features/connect-wallet/lib/CurveProvider'
import { Chain } from '@evm-ui/utils/network'
import { FormPlacementProvider } from '@evm-ui/widgets/DetailPageLayout/form-context/FormPlacementProvider'

const POOL_ADDRESS = '0x159a866f13f3931e256946ad7d921d18acbc599f'
const GAUGE_ADDRESS = '0x456ba8aa2aa07c26a6b5d5a6a029ab754fb851c2'
const MANAGER_ADDRESS = '0xE13aDC278c252e04DCBdca8eDced2C973Db994fA'
const REWARD_TOKEN_SYMBOL = 'DAI'
const REWARD_TOKEN_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F'
const REWARD_DISTRIBUTOR_ADDRESS = '0x427Caf62D66fCec08FA55F0991DBCA66a8BfA7E7'
const DEPOSIT_REWARD_TOKEN_SYMBOL = 'USDT'
const DEPOSIT_REWARD_TOKEN_ADDRESS = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
const FUND_AMOUNT = '0x3635c9adc5dea00000' // 1000 ETH in wei
const REWARD_TOKEN_FUND_AMOUNT = '0x5f5e100' // 100 USDT in token units
const DEPOSIT_REWARD_AMOUNT = '1'
const DEPOSIT_REWARD_AMOUNT_WEI = parseUnits(DEPOSIT_REWARD_AMOUNT, 6)

type GaugeManagementForm = 'addReward' | 'depositReward'

function GaugeManagementFormTest({ form }: { form: GaugeManagementForm }) {
  const { isPending } = useNetworksQuery()

  if (isPending) return <Loading />
  if (form === 'depositReward') return <DepositReward chainId={Chain.Ethereum} poolId={POOL_ADDRESS} />

  return <AddRewardToken chainId={Chain.Ethereum} poolId={POOL_ADDRESS} />
}

const GaugeManagementTestCase = ({
  vnet,
  privateKey,
  form,
}: TenderlyWagmiConfigFromVNet & { form: GaugeManagementForm }) => (
  <ComponentTestWrapper config={createTenderlyWagmiConfigFromVNet({ vnet, privateKey })} autoConnect>
    <CurveProvider
      app="dex"
      network={defaultNetworks[Chain.Ethereum]}
      onChainUnavailable={console.error}
      hydrate={{ dex: useStore(state => state.hydrate) }}
    >
      <FormPlacementProvider placement="inline">
        <GaugeManagementFormTest form={form} />
      </FormPlacementProvider>
    </CurveProvider>
  </ComponentTestWrapper>
)

describe('Gauge Management (RPC)', () => {
  skipTestsAfterFailure()

  const privateKey = generatePrivateKey()
  const { address } = privateKeyToAccount(privateKey)
  let adminRpcUrl: string
  let publicRpcUrl: string

  const getVirtualNetwork = createVirtualTestnet(uuid => ({
    slug: `gauge-management-${uuid}`,
    display_name: `GaugeManagement (${uuid})`,
    fork_config: { block_number: 'latest' },
    chain_id: Chain.Ethereum,
  }))

  before(() => {
    const vnet = getVirtualNetwork()
    const rpcUrls = getRpcUrls(vnet)
    adminRpcUrl = rpcUrls.adminRpcUrl
    publicRpcUrl = rpcUrls.publicRpcUrl

    fundEth({ adminRpcUrl, amountWei: FUND_AMOUNT, recipientAddresses: [MANAGER_ADDRESS, address] })
    setGaugeManager({
      adminRpcUrl,
      publicRpcUrl,
      gaugeAddress: GAUGE_ADDRESS,
      currentManagerAddress: MANAGER_ADDRESS,
      nextManagerAddress: address,
    })
    addGaugeReward({
      adminRpcUrl,
      publicRpcUrl,
      gaugeAddress: GAUGE_ADDRESS,
      managerAddress: address,
      rewardTokenAddress: DEPOSIT_REWARD_TOKEN_ADDRESS,
      distributorAddress: address,
    })
  })

  beforeEach(() => {
    adminRpcUrl = getRpcUrls(getVirtualNetwork()).adminRpcUrl
    fundEth({ adminRpcUrl, amountWei: FUND_AMOUNT, recipientAddresses: [address] })
    fundErc20({
      adminRpcUrl,
      tokenAddress: DEPOSIT_REWARD_TOKEN_ADDRESS,
      amountWei: REWARD_TOKEN_FUND_AMOUNT,
      recipientAddresses: [address],
    })
  })

  it('adds a gauge reward token', () => {
    cy.mount(<GaugeManagementTestCase vnet={getVirtualNetwork()} privateKey={privateKey} form="addReward" />)

    cy.contains(REWARD_TOKEN_SYMBOL, LOAD_TIMEOUT).should('be.visible')
    cy.get('[data-testid="add-reward-distributor-input"]').clear()
    cy.get('[data-testid="add-reward-distributor-input"]').type(REWARD_DISTRIBUTOR_ADDRESS)
    cy.get('[data-testid="add-reward-submit-button"]', LOAD_TIMEOUT).click()

    cy.contains(`Added reward token ${REWARD_TOKEN_SYMBOL}`, LOAD_TIMEOUT).should('be.visible')
    expectGaugeRewardDistributor({
      publicRpcUrl,
      gaugeAddress: GAUGE_ADDRESS,
      rewardTokenAddress: REWARD_TOKEN_ADDRESS,
      expectedDistributorAddress: REWARD_DISTRIBUTOR_ADDRESS,
    })
  })

  it('deposits a gauge reward token', () => {
    getErc20Balance({
      publicRpcUrl,
      tokenAddress: DEPOSIT_REWARD_TOKEN_ADDRESS,
      accountAddress: GAUGE_ADDRESS,
    }).then(initialBalance => {
      cy.mount(<GaugeManagementTestCase vnet={getVirtualNetwork()} privateKey={privateKey} form="depositReward" />)

      cy.contains(DEPOSIT_REWARD_TOKEN_SYMBOL, LOAD_TIMEOUT).should('be.visible')
      cy.get('[data-testid="deposit-amount"] input[type="text"]', LOAD_TIMEOUT).type(DEPOSIT_REWARD_AMOUNT)
      cy.get('[data-testid="deposit-reward-submit-button"]', LOAD_TIMEOUT).click()

      cy.contains(`Deposited reward token ${DEPOSIT_REWARD_TOKEN_SYMBOL}`, LOAD_TIMEOUT).should('be.visible')
      expectErc20BalanceChange({
        publicRpcUrl,
        tokenAddress: DEPOSIT_REWARD_TOKEN_ADDRESS,
        accountAddress: GAUGE_ADDRESS,
        initialBalance,
        expectedChange: DEPOSIT_REWARD_AMOUNT_WEI,
      })
    })
  })
})
