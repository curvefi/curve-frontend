import { generatePrivateKey, privateKeyToAccount } from 'viem/accounts'
import { useNetworksQuery } from '@/dex/entities/networks'
import { AddRewardToken } from '@/dex/features/add-gauge-reward-token'
import { defaultNetworks } from '@/dex/lib/networks'
import { useStore } from '@/dex/store/useStore'
import { Loading } from '@/routes/Loading'
import { ComponentTestWrapper } from '@cy/support/helpers/ComponentTestWrapper'
import { expectGaugeRewardDistributor, setGaugeManager } from '@cy/support/helpers/dex/gauge.helpers'
import { createVirtualTestnet } from '@cy/support/helpers/tenderly'
import {
  createTenderlyWagmiConfigFromVNet,
  getRpcUrls,
  type TenderlyWagmiConfigFromVNet,
} from '@cy/support/helpers/tenderly/vnet'
import { fundEth } from '@cy/support/helpers/tenderly/vnet-fund'
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
const FUND_AMOUNT = '0x3635c9adc5dea00000' // 1000 ETH in wei

function AddRewardTokenTest() {
  const { isPending } = useNetworksQuery()
  return isPending ? <Loading /> : <AddRewardToken chainId={Chain.Ethereum} poolId={POOL_ADDRESS} />
}

const AddRewardTestCase = ({ vnet, privateKey }: TenderlyWagmiConfigFromVNet) => (
  <ComponentTestWrapper config={createTenderlyWagmiConfigFromVNet({ vnet, privateKey })} autoConnect>
    <CurveProvider
      app="dex"
      network={defaultNetworks[Chain.Ethereum]}
      onChainUnavailable={console.error}
      hydrate={{ dex: useStore(state => state.hydrate) }}
    >
      <FormPlacementProvider placement="inline">
        <AddRewardTokenTest />
      </FormPlacementProvider>
    </CurveProvider>
  </ComponentTestWrapper>
)

describe('Gauge Add Reward (RPC)', () => {
  skipTestsAfterFailure()

  const privateKey = generatePrivateKey()
  const { address } = privateKeyToAccount(privateKey)
  const getVirtualNetwork = createVirtualTestnet(uuid => ({
    slug: `gauge-add-reward-${uuid}`,
    display_name: `GaugeAddReward (${uuid})`,
    fork_config: { block_number: 'latest' },
    chain_id: Chain.Ethereum,
  }))

  beforeEach(() => {
    const { adminRpcUrl } = getRpcUrls(getVirtualNetwork())
    fundEth({ adminRpcUrl, amountWei: FUND_AMOUNT, recipientAddresses: [MANAGER_ADDRESS, address] })
  })

  it('adds a gauge reward token', () => {
    const vnet = getVirtualNetwork()
    const { adminRpcUrl, publicRpcUrl } = getRpcUrls(vnet)

    setGaugeManager({
      adminRpcUrl,
      publicRpcUrl,
      gaugeAddress: GAUGE_ADDRESS,
      currentManagerAddress: MANAGER_ADDRESS,
      nextManagerAddress: address,
    })

    cy.mount(<AddRewardTestCase vnet={vnet} privateKey={privateKey} />)

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
})
