export enum LlamaMarketColumnId {
  Assets = 'assets',
  UserHealth = 'userHealth',
  UserBorrowed = 'userBorrowed',
  UserBoostMultiplier = 'userBoostMultiplier', // only for supply positions
  UserCollateral = 'userCollateral',
  UserLtv = 'userLtv',
  UserEarnings = 'userEarnings', // only for lend markets
  UserDeposited = 'userDeposited', // only for lend markets
  UserHasPositions = 'userHasPositions',
  NetBorrowRate = 'rates_borrow',
  BorrowChart = 'borrowChart',
  LendRate = 'rates_lend',
  MaxLtv = 'maxLtv',
  UtilizationPercent = 'utilizationPercent',
  LiquidityUsd = 'liquidityUsd',
  Chain = 'chain',
  CollateralSymbol = 'assets_collateral_symbol',
  BorrowedSymbol = 'assets_borrowed_symbol',
  IsFavorite = 'isFavorite',
  Rewards = 'rewards',
  Tvl = 'tvl',
  TotalDebt = 'totalDebtUsd',
  TotalCollateralUsd = 'totalCollateralUsd',
  DeprecatedMessage = 'deprecatedMessage',
  Type = 'type',
}
