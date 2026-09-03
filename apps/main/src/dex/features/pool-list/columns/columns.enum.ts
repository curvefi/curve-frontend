export enum PoolColumnId {
  PoolName = 'PoolName',
  Tokens = 'Tokens',
  // The 'APY' columns aren't exactly always APY, but we keep the enum for the sake of not needing a column visibility migration
  NetApy = 'NetApy',
  BaseApy = 'BaseApy',
  WeeklyBaseApy = 'WeeklyBaseApy',
  RewardsApy = 'RewardsApy',
  CrvApy = 'CrvApy',
  Points = 'Points',
  Volume = 'volume',
  Tvl = 'tvl',
  Age = 'Age',
}
