export enum LlamaMarketColumnId {
  Assets = 'assets',
  UserHealth = 'userHealth',
  UserBorrowed = 'userBorrowed',
  UserEarnings = 'userEarnings', // only for lend markets
  UserDeposited = 'userDeposited', // only for lend markets
  UserHasPosition = 'userHasPosition',
  BorrowRate = 'rates_borrow',
  BorrowChart = 'borrowChart',
  LendRate = 'rates_lend',
  UtilizationPercent = 'utilizationPercent',
  LiquidityUsd = 'liquidityUsd',
  Chain = 'chain',
  CollateralSymbol = 'assets_collateral_symbol',
  BorrowedSymbol = 'assets_borrowed_symbol',
  IsFavorite = 'isFavorite',
  Rewards = 'rewards',
  Type = 'type',
}
