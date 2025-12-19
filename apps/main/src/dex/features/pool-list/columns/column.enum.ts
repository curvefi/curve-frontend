export enum PoolColumnId {
  UserHasPositions = 'hasPosition',
  PoolName = 'PoolName',
  RewardsBase = 'RewardsBase',
  RewardsCrv = 'RewardsCrv',
  RewardsIncentives = 'RewardsIncentives',
  RewardsOther = 'RewardsOther', // == RewardsCrv + RewardsIncentives
  Volume = 'volume',
  Tvl = 'tvl',
  PoolTags = 'filter', // using `filter` to keep the old links valid
}
