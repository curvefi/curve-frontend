import { type Address, encodeFunctionData, parseAbi } from 'viem'
import { advanceVirtualNetworkClock } from '@cy/support/helpers/tenderly/vnet-admin'
import type { CreateVirtualTestnetResponse } from '@cy/support/helpers/tenderly/vnet-create'
import { LOAD_TIMEOUT } from '@cy/support/ui'
import type { Decimal } from '@primitives/decimal.utils'
import { formatNumber, formatUsd } from '@ui-kit/utils'
import { loadTenderlyAccount } from '../../tenderly/account'
import { sendVnetTransaction } from '../../tenderly/vnet-transaction'
import { getActionInfo, getActionValue } from '../action-info.helpers'
import { submitSupplyForm, SupplyActionType } from './supply.helpers'

const CLAIMABLE_AMOUNT_REGEX = /(\d[\d,]*(?:\.\d+)?)/
type ClaimRewardType = 'crv' | 'other'
const GAUGE_ABI = parseAbi([
  'function deposit(uint256 _value)',
  'function withdraw(uint256 _value)',
  'function user_checkpoint(address _addr) returns (bool)',
  'function manager() view returns (address)',
  'function add_reward(address _reward_token, address _distributor)',
  'function deposit_reward_token(address _reward_token, uint256 _amount, uint256 _epoch)',
])

const submitClaimForm = (type: SupplyActionType) => submitSupplyForm(type, 'Claimed rewards!')

const getClaimSubmitButton = (type: ClaimRewardType) =>
  cy.get(`[data-testid="supply-claim-${type}-rewards-submit-button"]`, LOAD_TIMEOUT)

export const submitClaimAndSettle = (
  type: ClaimRewardType,
  {
    waitForEmptyState = false,
  }: {
    waitForEmptyState?: boolean
  } = {},
) => {
  const rewardTypeId: SupplyActionType = `claim-${type}-rewards`
  return submitClaimForm(rewardTypeId).then(() => {
    if (waitForEmptyState) {
      getClaimSubmitButton(type).should('be.disabled')
      touchClaimForm(rewardTypeId)
    }
  })
}

const checkpointTenderlySupplyRewards = (
  {
    vnet,
    userAddress,
    gaugeAddress,
  }: {
    vnet: CreateVirtualTestnetResponse
    userAddress: Address
    gaugeAddress: Address
  }, // Some gauges expose freshly accrued rewards only after a user checkpoint updates internal reward accounting for that address.
) =>
  loadTenderlyAccount().then(async tenderlyAccount => {
    await sendVnetTransaction({
      tenderly: { ...tenderlyAccount, vnetId: vnet.id },
      tx: {
        from: userAddress,
        to: gaugeAddress,
        data: encodeFunctionData({
          abi: GAUGE_ABI,
          functionName: 'user_checkpoint',
          args: [userAddress],
        }),
      },
    })
  })

export const prepareClaimRewards = ({
  vnet,
  userAddress,
  gaugeAddress,
  rewardAccrualSeconds = 7 * 24 * 60 * 60,
}: {
  vnet: CreateVirtualTestnetResponse
  userAddress: Address
  gaugeAddress: Address
  rewardAccrualSeconds?: number
}) => {
  // Time travel to accrue rewards for the staked position.
  advanceVirtualNetworkClock({ vnet, seconds: rewardAccrualSeconds })
  // Trigger gauge accounting refresh
  return checkpointTenderlySupplyRewards({ vnet, userAddress, gaugeAddress })
}

/**
 * The claim tab has no editable inputs, so "touching" it means waiting for the
 * post-claim refetch to settle into the empty state.
 */
const touchClaimForm = (type: string) => {
  cy.get(`[data-testid="supply-${type}-submit-button"]`, LOAD_TIMEOUT).should('be.disabled')
}

/** Validates the structural state of the claim tab - button state, error presence, and empty state visibility. */
export function validateClaimTabState({
  crvButtonDisabled = true,
  otherRewardsButtonDisabled = true,
  noRewards = crvButtonDisabled && otherRewardsButtonDisabled,
}: {
  crvButtonDisabled?: boolean
  otherRewardsButtonDisabled?: boolean
  noRewards?: boolean
} = {}) {
  getClaimSubmitButton('crv').should(crvButtonDisabled ? 'be.disabled' : 'not.be.disabled')
  getClaimSubmitButton('other').should(otherRewardsButtonDisabled ? 'be.disabled' : 'not.be.disabled')
  cy.get('[data-testid="loan-form-errors"]').should('not.exist')
  cy.get('[data-testid="supply-claim-empty-state"]', LOAD_TIMEOUT).should(noRewards ? 'be.visible' : 'not.exist')
}

/**
 * Validates that claim details are structurally loaded and valid.
 * Focuses on structural completeness: data exists, amounts are valid numbers, notional values are present, and action info
 * is loaded.
 */
export function checkClaimDetailsLoaded({
  hasCrvRewards = true,
  hasOtherRewards = true,
  expectedSymbols,
  checkEstimatedTxCost = hasCrvRewards || hasOtherRewards,
}: {
  hasCrvRewards?: boolean
  hasOtherRewards?: boolean
  expectedSymbols?: string[]
  checkEstimatedTxCost?: boolean
} = {}) {
  if (hasCrvRewards || hasOtherRewards) {
    cy.get('[data-testid="claim-action-info-list"]').should('be.visible')
  } else {
    cy.get('[data-testid="claim-action-info-list"]').should('not.be.visible')
    return
  }

  if (checkEstimatedTxCost) {
    if (hasCrvRewards) {
      getActionValue('claim-crv-rewards-estimated-tx-cost').should('include', '$')
    } else {
      getActionInfo('claim-crv-rewards-estimated-tx-cost').should('have.text', '-')
    }

    if (hasOtherRewards) {
      getActionValue('claim-other-rewards-estimated-tx-cost').should('include', '$')
    } else {
      getActionInfo('claim-other-rewards-estimated-tx-cost').should('have.text', '-')
    }
  }

  cy.get('[data-testid="data-table"]', LOAD_TIMEOUT).should('exist')
  cy.get('[data-testid="data-table-cell-token"]', LOAD_TIMEOUT).should('have.length.at.least', 1)
  cy.get('[data-testid="data-table-cell-token"]').each($row => {
    const [, match] = CLAIMABLE_AMOUNT_REGEX.exec($row.text().replaceAll(',', '')) ?? []
    expect(match).to.not.equal(undefined)
    expect(Number(match)).to.be.greaterThan(0)
  })
  cy.get('[data-testid="data-table-cell-notional"]').should('have.length.at.least', 1)

  if (expectedSymbols && expectedSymbols.length > 1) {
    cy.get('[data-testid="rewards-value"]').should('be.visible')
  }

  expectedSymbols?.forEach(symbol => {
    cy.get('[data-testid="data-table-cell-token"]').contains(symbol)
  })
}

/**
 * Validates exact data values in the claim rewards table.
 * Performs precise matching of amounts, symbols, and notional values.
 */
export function checkClaimTableState({
  rows,
  totalNotional,
}: {
  rows: { amount: string; symbol: string; notional?: number }[]
  totalNotional?: number
}) {
  if (!rows.length) return

  cy.get('[data-testid="data-table-cell-token"]').should('have.length', rows.length)
  cy.get('[data-testid="data-table-cell-notional"]').should('have.length', rows.length)

  rows.forEach(({ amount, symbol, notional }, index) => {
    cy.get('[data-testid="data-table-cell-token"]')
      .eq(index)
      .within(() => {
        cy.contains(formatNumber(amount as Decimal, { abbreviate: false })).should('be.visible')
        cy.contains(symbol).should('be.visible')
      })

    cy.get('[data-testid="data-table-cell-notional"]')
      .eq(index)
      .contains(notional == null ? '-' : formatUsd(notional))
  })

  if (rows.length > 1 && totalNotional != null) {
    cy.get('[data-testid="rewards-value"]').should('be.visible')
    cy.contains(formatUsd(totalNotional)).should('be.visible')
  }
}
