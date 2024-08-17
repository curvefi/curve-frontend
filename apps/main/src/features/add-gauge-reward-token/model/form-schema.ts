import { create, test, enforce } from 'vest'
import { isAddress, isAddressEqual, zeroAddress, type Address } from 'viem'

export const addGaugeRewardTokenValidationSuite = create((data: { rewardTokenId: string; distributorId: string }) => {
  test('rewardTokenId', 'Invalid ERC20 token address', () => {
    enforce(isAddress(data.rewardTokenId)).isTruthy()
  })

  test('rewardTokenId', 'Reward token address cannot be zero address', () => {
    enforce(!isAddressEqual(data.rewardTokenId as Address, zeroAddress)).isTruthy()
  })

  test('distributorId', 'Invalid distributor address', () => {
    enforce(isAddress(data.distributorId)).isTruthy()
  })

  test('distributorId', 'Distributor address cannot be zero address', () => {
    enforce(!isAddressEqual(data.distributorId as Address, zeroAddress)).isTruthy()
  })
})
