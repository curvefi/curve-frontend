export enum PoolColumnId {
  PoolName = 'PoolName',
  Tokens = 'Tokens',
  // The rate columns aren't always APY, but we keep the enum value for the sake of not needing a column visibility migration
  NetRate = 'NetApy',
  BaseRate = 'BaseApy',
  WeeklyBaseRate = 'WeeklyBaseApy',
  RewardsRate = 'RewardsApy',
  CrvRate = 'CrvApy',
  Points = 'Points',
  Volume = 'volume',
  Tvl = 'tvl',
  Age = 'Age',
}
