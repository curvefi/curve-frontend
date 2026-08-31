export * from './lib'
export * from './types'
export { gaugeAddRewardValidationGroup, gaugeDepositRewardValidationGroup } from './model/gauge-validation'
export {
  useGaugeDepositRewardIsApproved,
  useGaugeManager,
  useGaugeRewardsDistributors,
  useIsDepositRewardAvailable,
} from './model/query-options'
