# Zustand Store Slice Usage Report

This document provides a comprehensive breakdown of all Zustand store slices in the `apps/main/src` directory, including their state properties, methods, and where they're currently being used.

## Overview

- **Total Stores:** 4 (DAO, DEX, LEND, LOAN)
- **Total Slices:** 52
- **Total Files Using Stores:** 245+

---

## 1. DAO Store

**Location:** `apps/main/src/dao/store/useStore.ts`

### AppSlice

**File:** `dao/store/createAppSlice.ts`

**Purpose:** Foundation slice with state management helpers

**Methods:**
- `updateGlobalStoreByKey` - Generic state update method
- `hydrate` - Resets states and refreshes data from API
- `setAppStateByActiveKey`, `setAppStateByKey`, `setAppStateByKeys`, `resetAppState` - State management helpers

**Usage:** Internally by other slices (foundational slice)

---

### ProposalsSlice

**File:** `dao/store/createProposalsSlice.ts`

**State Properties:**
- `voteTxMapper` - Transaction states for proposal votes
- `executeTxMapper` - Transaction states for proposal executions
- `searchValue` - Search filter value
- `activeFilter` - Active proposal filter (all/ownership/parameter/text)
- `activeSortBy` - Sort column
- `activeSortDirection` - Sort direction (asc/desc)

**Methods:**
- `setSearchValue` - Update search value
- `setActiveFilter` - Update filter selection
- `setActiveSortBy` - Update sort column
- `setActiveSortDirection` - Update sort direction
- `castVote` - Cast vote on proposal
- `executeProposal` - Execute proposal

**Used by (9 files):**
- `dao/components/PageProposals/index.tsx`
- `dao/hooks/useProposalsList.ts`
- `dao/components/UserBox/VoteDialog.tsx`
- `dao/components/PageProposal/index.tsx`
- `dao/store/createProposalsSlice.ts` (self)

---

### GaugesSlice

**File:** `dao/store/createGaugesSlice.ts`

**State Properties:**
- `gaugesLoading` - Loading state for gauges
- `txCastVoteState` - Transaction state for gauge votes
- `filteringGaugesLoading` - Loading state for filtering
- `gaugeListSortBy` - Sort configuration
- `searchValue` - Search text
- `gaugeMapper` - Map of all gauges
- `gaugeCurveApiData` - Gauge data from Curve API
- `gaugeVotesMapper` - Votes per gauge
- `gaugeWeightHistoryMapper` - Historical weight data
- `filteredGauges` - Filtered gauge list
- `gaugeVotesSortBy` - Sort config for votes
- `selectGaugeFilterValue` - Filter value for gauge selection
- `selectGaugeListResult` - Filtered gauge results
- `selectedGauge` - Currently selected gauge
- `userGaugeVoteWeightsSortBy` - Sort config for gauge vote weights

**Methods:**
- `getGauges` - Fetch all gauges
- `getGaugesData` - Fetch gauge data from API
- `getGaugeVotes` - Fetch votes for specific gauge
- `getHistoricGaugeWeights` - Fetch historical weights
- `setSearchValue` - Update search
- `setGaugeListSortBy` - Update sort
- `selectFilteredSortedGauges` - Get filtered/sorted gauges
- `setGauges` - Update gauge list
- `setGaugeVotesSortBy` - Update vote sort
- `setSelectGaugeFilterValue` - Update filter
- `setSelectedGauge` - Set selected gauge
- `castVote` - Cast gauge weight vote
- `setUserGaugeVoteWeightsSortBy` - Update user gauge vote weights sort

**Used by (24 files):**
- `dao/hooks/useAutoRefresh.tsx`
- `dao/components/PageGauges/GaugeList/index.tsx`
- `dao/components/PageGauges/GaugeListItem/index.tsx`
- `dao/components/PageGauges/GaugeListItem/GaugeListColumns.tsx`
- `dao/components/PageGauges/GaugeListItem/GaugeWeightVotesColumns.tsx`
- `dao/components/PageGauges/GaugeListItem/SmallScreenCard.tsx`
- `dao/components/PageGauge/index.tsx`
- `dao/components/PageGauge/GaugeMetrics/index.tsx`
- `dao/components/PageGauge/GaugeVotesTable/index.tsx`
- `dao/components/PageGauges/GaugeVoting/CurrentVotes.tsx`
- `dao/components/PageGauges/GaugeVoting/GaugeVotingStats.tsx`
- `dao/components/PageGauges/GaugeVoting/VoteGauge/index.tsx`
- `dao/components/PageGauges/GaugeVoting/VoteGaugeField/index.tsx`
- `dao/components/PageGauges/GaugeWeightDistribution/index.tsx`
- `dao/components/ComboBoxSelectGauge/index.tsx`
- `dao/components/ComboBoxSelectGauge/ComboBox.tsx`
- `dao/components/Charts/GaugeWeightHistoryChart/index.tsx`
- `dao/store/createGaugesSlice.ts` (self)

---

### UserSlice

**File:** `dao/store/createUserSlice.ts`

**State Properties:**
- `userVeCrv` - User's veCRV data (veCrv, veCrvPct, lockedCrv, unlockTime)
- `snapshotVeCrvMapper` - Historical snapshot voting power
- `userAddress` - User wallet address
- `userEns` - User ENS name
- `userMapper` - Map of user data
- `userLocksSortBy` - Sort config for locks table
- `userProposalVotesSortBy` - Sort config for proposal votes
- `userGaugeVotesSortBy` - Sort config for gauge votes
- `userGaugeVoteWeightsSortBy` - Sort config for gauge vote weights

**Methods:**
- `updateUserData` - Update user veCRV data
- `getUserEns` - Fetch ENS name
- `setUserProposalVotesSortBy` - Update sort
- `setUserLocksSortBy` - Update sort
- `setUserGaugeVotesSortBy` - Update sort
- `setUserGaugeVoteWeightsSortBy` - Update sort
- `setSnapshotVeCrv` - Fetch snapshot voting power

**Used by (15 files):**
- `dao/components/UserBox/UserInformation.tsx`
- `dao/components/UserBox/VoteDialog.tsx`
- `dao/components/PageUser/index.tsx`
- `dao/components/PageUser/UserProposalVotesTable/index.tsx`
- `dao/components/PageUser/UserLocksTable/index.tsx`
- `dao/components/PageUser/UserGaugeVotesTable/index.tsx`
- `dao/components/PageProposal/index.tsx`
- `dao/components/ComboBoxSelectGauge/index.tsx`
- `dao/store/createUserSlice.ts` (self)

---

### AnalyticsSlice

**File:** `dao/store/createAnalyticsSlice.ts`

**State Properties:**
- `veCrvFees` - Fee distribution data (fees, veCrvTotalFees, fetchStatus)
- `veCrvLocks` - Daily lock data
- `veCrvHolders` - Holder data (topHolders, allHolders, totalHolders, canCreateVote, totalValues, fetchStatus)
- `topHoldersSortBy` - Sort key for top holders
- `allHoldersSortBy` - Sort config for all holders

**Methods:**
- `getVeCrvFees` - Fetch fee distributions
- `getVeCrvLocks` - Fetch daily locks
- `getVeCrvHolders` - Fetch holder data
- `setTopHoldersSortBy` - Update sort
- `setAllHoldersSortBy` - Update sort

**Used by (8 files):**
- `dao/components/PageAnalytics/index.tsx`
- `dao/components/PageAnalytics/CrvStats/index.tsx`
- `dao/components/PageAnalytics/VeCrvFeesTable/index.tsx`
- `dao/components/PageAnalytics/VeCrvFeesChart/index.tsx`
- `dao/components/PageAnalytics/DailyLocksChart/index.tsx`
- `dao/components/PageAnalytics/HoldersTable/index.tsx`
- `dao/components/PageAnalytics/TopHoldersChart/index.tsx`
- `dao/components/PageUser/index.tsx`
- `dao/store/createAnalyticsSlice.ts` (self)

---

### LockedCrvSlice

**File:** `dao/store/createLockedCrvSlice.ts`

**State Properties:**
- `activeKey` - Active form key
- `activeKeyVecrvInfo` - Active key for veCRV info
- `formEstGas` - Gas estimates by active key
- `formValues` - Form values (lockedAmt, days, utcDate, etc.)
- `formStatus` - Form status (isApproved, formProcessing, step, error, etc.)
- `withdrawLockedCrvStatus` - Withdrawal transaction status

**Methods:**
- `setFormValues` - Update form values
- `fetchEstGasApproval` - Estimate gas for approval
- `fetchStepApprove` - Execute approval
- `fetchStepCreate` - Create new lock
- `fetchStepIncreaseCrv` - Increase CRV amount
- `fetchStepIncreaseTime` - Increase lock time
- `withdrawLockedCrv` - Withdraw locked CRV
- `resetState` - Reset form state

**Used by (7 files):**
- `dao/components/PageVeCrv/index.tsx`
- `dao/components/PageVeCrv/Page.tsx`
- `dao/components/PageVeCrv/components/FormLockCreate.tsx`
- `dao/components/PageVeCrv/components/FormLockCrv.tsx`
- `dao/components/PageVeCrv/components/FormLockDate.tsx`
- `dao/components/PageVeCrv/components/FormWithdraw.tsx`
- `dao/store/createLockedCrvSlice.ts` (self)

---

## 2. DEX Store

**Location:** `apps/main/src/dex/store/useStore.ts`

### GlobalSlice

**File:** `dex/store/createGlobalSlice.ts`

**Purpose:** Foundation slice with global state management

**State Properties:**
- `hasDepositAndStake` - Network has deposit+stake feature
- `hasRouter` - Network has router

**Methods:**
- `getNetworkConfigFromApi` - Get network config
- `setNetworkConfigFromApi` - Set network config
- `hydrate` - Hydrate store on network/user change
- `updateGlobalStoreByKey` - Generic update
- `setAppStateByActiveKey`, `setAppStateByKey`, `setAppStateByKeys`, `resetAppState` - State helpers

**Usage:** Internally by other slices (foundational slice)

---

### CacheSlice

**File:** `dex/store/createCacheSlice.ts`

**State Properties:**
- `storeCache.poolsMapper` - Cached pool data
- `storeCache.routerFormValues` - Cached router form values
- `storeCache.volumeMapper` - Cached volume data
- `storeCache.tvlMapper` - Cached TVL data
- `storeCache.hasDepositAndStake` - Cached network feature
- `storeCache.hasRouter` - Cached network feature

**Methods:**
- `setStoreCache` - Update cache

**Used by (6 files):**
- Accessed for cached data across various components
- `dex/store/createCacheSlice.ts` (self)

---

### PoolListSlice

**File:** `dex/store/createPoolListSlice.ts`

**State Properties:**
- `activeKey` - Active filter/sort key
- `formValues` - Filter form values
- `formStatus` - Loading/error status
- `result` - Filtered pool IDs
- `searchedByAddresses` - Address search results
- `searchedTerms` - Search terms
- `showHideSmallPools` - Toggle small pools

**Methods:**
- `filterByKey` - Filter by specific key
- `filterBySearchText` - Filter by search text
- `filterSmallTvl` - Filter by TVL
- `sortFn` - Sort pools
- `setSortAndFilterData` - Update sort/filter
- `setSortAndFilterCachedData` - Update with cached data
- `setFormValues` - Update form values

**Used by (5 files):**
- `dex/components/PagePoolList/index.tsx`
- `dex/components/PagePoolList/Page.tsx`
- `dex/components/PagePoolList/components/TableSettings/TableSettings.tsx`
- `dex/components/PagePoolList/components/PoolRow.tsx`
- `dex/features/pool-list/hooks/usePoolListData.tsx`
- `dex/store/createPoolListSlice.ts` (self)

---

### PoolsSlice

**File:** `dex/store/createPoolsSlice.ts`

**State Properties:**
- `poolsMapper` - Map of all pools
- `pricesApiState` - Prices API fetch state
- `pricesApiPoolsMapper` - Pool data from prices API
- `pricesApiPoolDataMapper` - Additional pool data
- `rewardsApyMapper` - Rewards APY data
- `tvlMapper` - TVL data
- `volumeMapper` - Volume data
- `snapshotsMapper` - Pool snapshots
- `currencyReserves` - Currency reserves
- `stakedMapper` - Staked amounts
- `basePools` - Base pool data
- `basePoolsLoading` - Loading state
- `haveAllPools` - All pools loaded flag

**Methods:**
- `fetchPools` - Fetch pools
- `fetchNewPool` - Fetch new pool
- `fetchPoolsVolume` - Fetch volume
- `fetchPoolsTvl` - Fetch TVL
- `fetchPoolsRewardsApy` - Fetch rewards APY
- `fetchMissingPoolsRewardsApy` - Fetch missing APY
- `fetchPoolStats` - Fetch pool stats
- `fetchPricesApiActivity` - Fetch activity
- `fetchPricesApiCharts` - Fetch chart data
- `fetchMorePricesApiCharts` - Fetch more charts
- `fetchPricesPoolSnapshots` - Fetch snapshots
- `setPoolIsWrapped` - Set wrapped flag
- `setChartTimeOption` - Set chart time
- `setStateByActiveKey` - State helper

**Used by (28+ files):**
- `dex/components/PagePool/index.tsx`
- `dex/components/PagePool/Page.tsx`
- `dex/components/PagePoolList/Page.tsx`
- `dex/components/PagePool/PoolDetails/*` (multiple files)
- `dex/components/PagePool/UserDetails/index.tsx`
- `dex/hooks/useAutoRefresh.tsx`
- `dex/hooks/useDexAppStats.ts`
- `dex/hooks/usePoolTotalStaked.tsx`
- `dex/components/PoolLabel.tsx`
- Many more pool-related components
- `dex/store/createPoolsSlice.ts` (self)

---

### PoolDepositSlice

**File:** `dex/store/createPoolDepositSlice.ts`

**State Properties:**
- `activeKey` - Active deposit key
- `formValues` - Deposit amounts
- `formStatus` - Transaction status
- `formEstGas` - Gas estimates
- `slippage` - Slippage tolerance
- `maxLoading` - Max amount loading
- `formType` - Deposit type (deposit/stake/deposit+stake)

**Methods:**
- `setFormValues` - Update form
- `fetchStepApprove` - Approve tokens
- `fetchStepDeposit` - Execute deposit
- `fetchStepStake` - Execute stake
- `fetchStepStakeApprove` - Approve for stake
- `fetchStepDepositStake` - Deposit and stake
- `resetState` - Reset form
- `setStateByKeys` - State helper

**Used by (7 files):**
- `dex/components/PagePool/Deposit/index.tsx`
- `dex/components/PagePool/Deposit/components/FormDeposit.tsx`
- `dex/components/PagePool/Deposit/components/FormDepositStake.tsx`
- `dex/components/PagePool/Deposit/components/FormStake.tsx`
- `dex/components/PagePool/Deposit/components/FieldsDeposit.tsx`
- `dex/store/createPoolDepositSlice.ts` (self)

---

### PoolWithdrawSlice

**File:** `dex/store/createPoolWithdrawSlice.ts`

**State Properties:**
- `activeKey` - Active withdrawal key
- `formValues` - Withdrawal amounts
- `formStatus` - Transaction status
- `formEstGas` - Gas estimates
- `slippage` - Slippage tolerance
- `formType` - Withdrawal type (withdraw/unstake/claim)

**Methods:**
- `setFormValues` - Update form
- `fetchStepApprove` - Approve
- `fetchStepWithdraw` - Execute withdrawal
- `fetchStepUnstake` - Execute unstake
- `fetchStepClaim` - Claim rewards
- `fetchClaimable` - Get claimable amounts
- `resetState` - Reset form
- `setStateByKey` - State helper

**Used by (7 files):**
- `dex/components/PagePool/Withdraw/index.tsx`
- `dex/components/PagePool/Withdraw/components/FormWithdraw.tsx`
- `dex/components/PagePool/Withdraw/components/FormClaim.tsx`
- `dex/components/PagePool/Withdraw/components/FormUnstake.tsx`
- `dex/store/createPoolWithdrawSlice.ts` (self)

---

### PoolSwapSlice

**File:** `dex/store/createPoolSwapSlice.ts`

**State Properties:**
- `activeKey` - Active swap key
- `formValues` - Swap amounts and tokens
- `formStatus` - Transaction status
- `formEstGas` - Gas estimates
- `exchangeOutput` - Expected output
- `isMaxLoading` - Max calculation loading

**Methods:**
- `setFormValues` - Update form
- `fetchStepApprove` - Approve token
- `fetchStepSwap` - Execute swap
- `resetState` - Reset form

**Used by (2 files):**
- `dex/components/PagePool/Swap/index.tsx`
- `dex/store/createPoolSwapSlice.ts` (self)

---

### UserSlice

**File:** `dex/store/createUserSlice.ts`

**State Properties:**
- `walletBalances` - User token balances
- `walletBalancesLoading` - Loading state
- `poolList` - User's pool list
- `poolListLoaded` - Loaded flag
- `poolListError` - Error state
- `userShare` - User pool share
- `userLiquidityUsd` - User liquidity in USD
- `userCrvApy` - User CRV APY
- `userWithdrawAmounts` - Withdrawal amounts

**Methods:**
- `fetchUserPoolInfo` - Fetch user pool info
- `fetchUserPoolListByKeys` - Fetch pools by keys

**Used by (12+ files):**
- `dex/components/PagePool/UserDetails/index.tsx`
- `dex/components/PagePoolList/index.tsx`
- `dex/features/pool-list/hooks/usePoolListData.tsx`
- `dex/components/PageDashboard/index.tsx`
- Many more user-related components
- `dex/store/createUserSlice.ts` (self)

---

### DashboardSlice

**File:** `dex/store/createDashboardSlice.ts`

**State Properties:**
- `activeKey` - Active dashboard key
- `dashboardDatasMapper` - Dashboard data
- `dashboardDataPoolIds` - Pool IDs
- `claimableFees` - Claimable fees
- `formStatus` - Form status
- `formValues` - Form values
- `vecrvInfo` - veCRV info
- `loading` - Loading state
- `error` - Error state
- `noResult` - No results flag
- `searchedWalletAddresses` - Searched addresses

**Methods:**
- `fetchStepClaimFees` - Claim fees
- `fetchStepWithdrawVecrv` - Withdraw veCRV
- `setFormValues` - Update form
- `setFormStatusClaimFees` - Update claim status
- `setFormStatusVecrv` - Update veCRV status

**Used by (5 files):**
- `dex/components/PageDashboard/index.tsx`
- `dex/components/PageDashboard/components/Summary.tsx`
- `dex/components/PageDashboard/components/FormClaimFees.tsx`
- `dex/components/PageDashboard/components/FormClaimFeesButtons.tsx`
- `dex/components/PageDashboard/components/FormVecrv.tsx`
- `dex/store/createDashboardSlice.ts` (self)

---

### QuickSwapSlice

**File:** `dex/store/createQuickSwapSlice.ts`

**State Properties:**
- `activeKey` - Active swap key
- `formValues` - Swap form values
- `formStatus` - Transaction status
- `formEstGas` - Gas estimates
- `routesAndOutput` - Routes and output
- `tokenList` - Available tokens
- `isMaxLoading` - Max loading

**Methods:**
- `setFormValues` - Update form
- `updateTokenList` - Update tokens
- `resetFormErrors` - Reset errors
- `fetchStepApprove` - Approve
- `fetchStepSwap` - Execute swap

**Used by (2 files):**
- `dex/components/PageRouterSwap/index.tsx`
- `dex/store/createQuickSwapSlice.ts` (self)

---

### UserBalancesSlice

**File:** `dex/store/createUserBalancesSlice.ts`

**State Properties:**
- `userBalancesMapper` - User balances by token
- `loading` - Loading state

**Methods:**
- `fetchAllStoredBalances` - Fetch all balances

**Used by (3 files):**
- `dex/components/PagePool/Deposit/components/FieldsDeposit.tsx`
- `dex/store/createUserBalancesSlice.ts` (self)

---

### TokensSlice

**File:** `dex/store/createTokensSlice.ts`

**State Properties:**
- `tokensMapper` - Token data
- `tokensNameMapper` - Token names

**Methods:**
- `setTokensMapper` - Update tokens

**Used by (3 files):**
- `dex/hooks/useTokensMapper.tsx`
- `dex/hooks/useTokensNameMapper.tsx`
- `dex/store/createTokensSlice.ts` (self)

---

### LockedCrvSlice

**File:** `dex/store/createLockedCrvSlice.ts`

**Purpose:** Similar to DAO LockedCrvSlice, used for veCRV management in DEX context

**Used by (4 files):**
- `dex/components/PageDashboard/components/FormVecrv.tsx`
- `dex/store/createLockedCrvSlice.ts` (self)

---

### CreatePoolSlice

**File:** `dex/store/createCreatePoolSlice.ts`

**State Properties:**
- `tokensInPool` - Selected tokens
- `parameters` - Pool parameters
- `validation` - Validation state
- `swapType` - Pool type (stableswap/cryptoswap)
- `transactionState` - Transaction status
- `poolPresetIndex` - Preset selection
- `initialPrice` - Initial prices
- `poolName` - Pool name
- `poolSymbol` - Pool symbol
- `advanced` - Advanced mode
- `userAddedTokens` - Custom tokens
- `navigationIndex` - Current step

**Methods:**
- `updateTokensInPool` - Update token selection
- `updateSwapType` - Update pool type
- `updateParameters` - Update various parameters
- `updateValidation` - Update validation
- `deployPool` - Deploy pool
- `resetState` - Reset form
- `setNavigationIndex` - Change step

**Used by (25 files):**
- `dex/components/PageCreatePool/index.tsx`
- `dex/components/PageCreatePool/TokensInPool/index.tsx`
- `dex/components/PageCreatePool/TokensInPool/SelectToken.tsx`
- `dex/components/PageCreatePool/TokensInPool/SetOracle.tsx`
- `dex/components/PageCreatePool/TokensInPool/SelectTokenButton.tsx`
- `dex/components/PageCreatePool/Summary/index.tsx`
- `dex/components/PageCreatePool/Summary/OracleSummary.tsx`
- `dex/components/PageCreatePool/Summary/TokensInPoolSummary.tsx`
- `dex/components/PageCreatePool/Summary/ParametersSummary/*`
- `dex/components/PageCreatePool/Summary/PoolInfoSummary.tsx`
- `dex/components/PageCreatePool/Summary/PoolTypeSummary.tsx`
- `dex/components/PageCreatePool/Summary/PoolPresetSummary.tsx`
- `dex/components/PageCreatePool/Parameters/*`
- `dex/components/PageCreatePool/PoolInfo/index.tsx`
- `dex/components/PageCreatePool/PoolType/index.tsx`
- `dex/components/PageCreatePool/ConfirmModal/*`
- `dex/components/PageCreatePool/components/*`
- `dex/store/createCreatePoolSlice.ts` (self)

---

### IntegrationsSlice

**File:** `dex/store/createIntegrationsSlice.ts`

**State Properties:**
- `integrationsList` - List of integrations
- `integrationsTags` - Available tags
- `formValues` - Filter values
- `formStatus` - Status
- `results` - Filtered results

**Methods:**
- `init` - Initialize
- `setFormValues` - Update filters

**Used by (2 files):**
- `dex/components/PageIntegrations/index.tsx`
- `dex/components/PageIntegrations/Page.tsx`
- `dex/store/createIntegrationsSlice.ts` (self)

---

### DeployGaugeSlice

**File:** `dex/store/createDeployGaugeSlice.ts`

**State Properties:**
- `currentPoolType` - Pool type
- `currentSidechain` - Selected sidechain
- `sidechainNav` - Navigation state
- `lpTokenAddress` - LP token address
- `poolAddress` - Pool address
- `sidechainGauge` - Sidechain gauge
- `linkPoolAddress` - Link pool address
- `curveNetworks` - Available networks
- `deploymentStatus` - Deployment status

**Methods:**
- `setCurrentPoolType` - Update pool type
- `setCurrentSidechain` - Update sidechain
- `setSidechainNav` - Update nav
- `setLpTokenAddress` - Set LP address
- `setPoolAddress` - Set pool address
- `setSidechainGauge` - Set gauge
- `setCurveNetworks` - Set networks
- `deployGauge` - Deploy gauge

**Used by (5 files):**
- `dex/components/PageDeployGauge/index.tsx`
- `dex/components/PageDeployGauge/DeployMainnet.tsx`
- `dex/components/PageDeployGauge/DeploySidechain.tsx`
- `dex/components/PageDeployGauge/ProcessSummary.tsx`
- `dex/components/PageDeployGauge/components/DeployGaugeButton.tsx`
- `dex/store/createDeployGaugeSlice.ts` (self)

---

## 3. LEND Store

**Location:** `apps/main/src/lend/store/useStore.ts`

### AppSlice

**File:** `lend/store/createAppSlice.ts`

**Purpose:** Foundation slice with state management helpers

**Usage:** Internally by other slices

---

### ChartBandsSlice

**File:** `lend/store/createChartBandsStore.tsx`

**State Properties:**
- `xAxisDisplayType` - Chart x-axis type

**Methods:**
- `setStateByKey` - State helper

**Used by (5 files):**
- `lend/components/ChartBandBalances/index.tsx`
- `lend/components/ChartBandBalances/ChartBandBalancesSettingsContent.tsx`
- `lend/components/DetailInfoLiqRange.tsx`
- `lend/components/DetailInfoHealth.tsx`
- `lend/components/DetailsMarket/components/DetailsLoanChartBalances.tsx`
- `lend/components/DetailsUser/components/DetailsUserLoanChartBandBalances.tsx`
- `lend/store/createChartBandsStore.tsx` (self)

---

### MarketsSlice

**File:** `lend/store/createMarketsSlice.ts`

**State Properties:**
- `statsBandsMapper` - Band statistics
- `statsCapAndAvailableMapper` - Cap and available stats
- `maxLeverageMapper` - Max leverage per market
- `pricesMapper` - Market prices
- `ratesMapper` - Market rates
- `rewardsMapper` - Vault rewards
- `marketDetailsView` - Details view type

**Methods:**
- `fetchDatas` - Fetch grouped data
- `fetchAll` - Fetch all market data
- `setStateByKey` - State helper

**Used by (6 files):**
- `lend/hooks/useMarketDetails.tsx`
- `lend/hooks/useSupplyTotalApr.ts`
- `lend/hooks/useMarketRates.ts`
- `lend/store/createMarketsSlice.ts` (self)

---

### UserSlice

**File:** `lend/store/createUserSlice.ts`

**State Properties:**
- `marketsBalancesMapper` - User balances per market
- `loansDetailsMapper` - User loan details

**Methods:**
- `fetchUserMarketBalances` - Fetch balances
- `fetchAll` - Fetch all user data

**Used by (4 files):**
- `lend/hooks/useBorrowPositionDetails.ts`
- `lend/hooks/useUserLoanDetails.ts`
- `lend/store/createUserSlice.ts` (self)

---

### LoanCreateSlice

**File:** `lend/store/createLoanCreateSlice.ts`

**State Properties:**
- `activeKey` - Active loan key
- `activeKeyLiqRange` - Liquidation range key
- `activeKeyMax` - Max borrow key
- `formValues` - Loan creation form
- `formStatus` - Transaction status
- `formEstGas` - Gas estimates
- `detailInfo` - Detail calculations
- `detailInfoLeverage` - Leverage details
- `liqRanges` - Liquidation ranges
- `liqRangesMapper` - Ranges by key
- `maxRecv` - Max receivable
- `maxLeverage` - Max leverage
- `isEditLiqRange` - Edit mode flag

**Methods:**
- `setFormValues` - Update form
- `fetchStepApprove` - Approve
- `fetchStepCreate` - Create loan
- `refetchMaxRecv` - Recalculate max
- `onLoanCreated` - Callback
- `resetState` - Reset

**Used by (8 files):**
- `lend/components/PageLoanCreate/index.tsx`
- `lend/components/PageLoanCreate/Page.tsx`
- `lend/components/PageLoanCreate/LoanFormCreate/index.tsx`
- `lend/components/PageLoanCreate/LoanFormCreate/components/DetailInfo.tsx`
- `lend/components/PageLoanCreate/LoanFormCreate/components/DetailInfoLeverage.tsx`
- `lend/components/PageLoanCreate/LoanFormCreate/components/DetailInfoNonLeverage.tsx`
- `lend/components/AlertNoLoanFound.tsx`
- `lend/store/createLoanCreateSlice.ts` (self)

---

### LoanCollateralRemoveSlice

**File:** `lend/store/createLoanCollateralRemoveSlice.ts`

**State Properties:**
- `activeKey`, `formValues`, `formStatus`, `formEstGas`, `detailInfo`, `maxRemovable`

**Methods:**
- `setFormValues`, `fetchStepDecrease`, `resetState`

**Used by (2 files):**
- `lend/components/PageLoanManage/LoanCollateralRemove/index.tsx`
- `lend/store/createLoanCollateralRemoveSlice.ts` (self)

---

### LoanCollateralAddSlice

**File:** `lend/store/createLoanCollateralAddSlice.ts`

**State Properties:**
- `activeKey`, `formValues`, `formStatus`, `formEstGas`, `detailInfo`

**Methods:**
- `setFormValues`, `fetchStepApprove`, `fetchStepIncrease`, `resetState`

**Used by (2 files):**
- `lend/components/PageLoanManage/LoanCollateralAdd/index.tsx`
- `lend/store/createLoanCollateralAddSlice.ts` (self)

---

### LoanRepaySlice

**File:** `lend/store/createLoanRepaySlice.ts`

**State Properties:**
- `activeKey`, `formValues`, `formStatus`, `formEstGas`, `detailInfo`, `detailInfoLeverage`

**Methods:**
- `setFormValues`, `fetchStepApprove`, `fetchStepRepay`, `resetState`

**Used by (4 files):**
- `lend/components/PageLoanManage/LoanRepay/index.tsx`
- `lend/components/PageLoanManage/LoanRepay/components/DetailInfo.tsx`
- `lend/components/PageLoanManage/Page.tsx`
- `lend/store/createLoanRepaySlice.ts` (self)

---

### LoanBorrowMoreSlice

**File:** `lend/store/createLoanBorrowMoreSlice.ts`

**State Properties:**
- `activeKey`, `activeKeyMax`, `formValues`, `formStatus`, `formEstGas`, `detailInfo`, `detailInfoLeverage`, `maxRecv`

**Methods:**
- `setFormValues`, `refetchMaxRecv`, `fetchStepApprove`, `fetchStepIncrease`, `resetState`

**Used by (5 files):**
- `lend/components/PageLoanManage/LoanBorrowMore/index.tsx`
- `lend/components/PageLoanManage/LoanBorrowMore/components/DetailInfo.tsx`
- `lend/components/PageLoanManage/LoanBorrowMore/components/DetailInfoLeverage.tsx`
- `lend/components/PageLoanManage/Page.tsx`
- `lend/store/createLoanBorrowMoreSlice.ts` (self)

---

### LoanSelfLiquidationSlice

**File:** `lend/store/createLoanSelfLiquidationSlice.ts`

**State Properties:**
- `formStatus`, `formEstGas`, `liquidationAmt`, `futureRates`

**Methods:**
- `fetchDetails`, `fetchStepApprove`, `fetchStepLiquidate`, `resetState`

**Used by (2 files):**
- `lend/components/PageLoanManage/LoanSelfLiquidation/index.tsx`
- `lend/store/createLoanSelfLiquidationSlice.ts` (self)

---

### VaultDepositMintSlice

**File:** `lend/store/createVaultDepositMintSlice.ts`

**State Properties:**
- `activeKey`, `formValues`, `formStatus`, `formEstGas`, `detailInfo`, `max`

**Methods:**
- `setFormValues`, `fetchStepApprove`, `fetchStepDepositMint`, `resetState`

**Used by (2 files):**
- `lend/components/PageVault/VaultDepositMint/index.tsx`
- `lend/store/createVaultDepositMintSlice.ts` (self)

---

### VaultWithdrawRedeemSlice

**File:** `lend/store/createVaultWithdrawRedeemSlice.ts`

**State Properties:**
- `activeKey`, `formValues`, `formStatus`, `formEstGas`, `detailInfo`, `max`

**Methods:**
- `setFormValues`, `fetchStepWithdrawRedeem`, `resetState`

**Used by (2 files):**
- `lend/components/PageVault/VaultWithdrawRedeem/index.tsx`
- `lend/store/createVaultWithdrawRedeemSlice.ts` (self)

---

### VaultStakeSlice

**File:** `lend/store/createVaultStakeSlice.ts`

**State Properties:**
- `activeKey`, `formValues`, `formStatus`, `formEstGas`

**Methods:**
- `setFormValues`, `fetchStepApprove`, `fetchStepStake`, `resetState`

**Used by (2 files):**
- `lend/components/PageVault/VaultStake/index.tsx`
- `lend/store/createVaultStakeSlice.ts` (self)

---

### VaultUnstakeSlice

**File:** `lend/store/createVaultUnstakeSlice.ts`

**State Properties:**
- `activeKey`, `formValues`, `formStatus`, `formEstGas`

**Methods:**
- `setFormValues`, `fetchStepUnstake`, `resetState`

**Used by (2 files):**
- `lend/components/PageVault/VaultUnstake/index.tsx`
- `lend/store/createVaultUnstakeSlice.ts` (self)

---

### IntegrationsSlice

**File:** `lend/store/createIntegrationsSlice.ts`

**Purpose:** Similar to DEX IntegrationsSlice

**Used by (2 files):**
- `lend/components/PageIntegrations/index.tsx`
- `lend/components/PageIntegrations/Page.tsx`
- `lend/store/createIntegrationsSlice.ts` (self)

---

### VaultClaimSlice

**File:** `lend/store/createVaultClaimSlice.ts`

**State Properties:**
- `formStatus`, `claimable`

**Methods:**
- `setFormValues`, `fetchStepClaim`, `resetState`

**Used by (2 files):**
- `lend/components/PageVault/VaultClaim/index.tsx`
- `lend/store/createVaultClaimSlice.ts` (self)

---

### OhlcChartSlice

**File:** `lend/store/createOhlcChartSlice.ts`

**State Properties:**
- `timeOption` - Chart time option
- `chartLlammaOhlc` - LLAMMA OHLC data
- `chartOraclePoolOhlc` - Oracle pool OHLC data
- `lendControllerData` - Controller data
- `lendTradesData` - Trades data
- `activityFetchStatus` - Activity fetch status
- `oraclePriceVisible` - Oracle price visibility
- `liqRangeCurrentVisible` - Current liquidation range visibility
- `liqRangeNewVisible` - New liquidation range visibility

**Methods:**
- `fetchLlammaOhlcData` - Fetch LLAMMA OHLC
- `fetchOraclePoolOhlcData` - Fetch oracle OHLC
- `fetchPoolActivity` - Fetch pool activity
- `fetchMoreData` - Fetch more data
- `setChartTimeOption` - Set time option
- `toggleOraclePriceVisible` - Toggle oracle price
- `toggleLiqRangeCurrentVisible` - Toggle current range
- `toggleLiqRangeNewVisible` - Toggle new range

**Used by (3 files):**
- `lend/components/ChartOhlcWrapper/index.tsx`
- `lend/components/ChartOhlcWrapper/PoolActivity.tsx`
- `lend/store/createOhlcChartSlice.ts` (self)

---

## 4. LOAN Store

**Location:** `apps/main/src/loan/store/useStore.ts`

### AppSlice

**File:** `loan/store/createAppSlice.ts`

**Purpose:** Foundation slice with state management helpers

**Usage:** Internally by other slices

---

### ChartBandsSlice

**File:** `loan/store/createChartBandsStore.tsx`

**Purpose:** Same as LEND ChartBandsSlice

**Used by (3 files):**
- `loan/components/ChartBandBalances/index.tsx`
- `loan/components/ChartBandBalances/ChartBandBalancesSettingsContent.tsx`
- `loan/components/LoanInfoLlamma/components/DetailsBandsChart.tsx`
- `loan/components/ChartUserBands.tsx`
- `loan/store/createChartBandsStore.tsx` (self)

---

### LoansSlice

**File:** `loan/store/createLoansSlice.ts`

**State Properties:**
- `detailsMapper` - Loan details by market
- `userDetailsMapper` - User loan details
- `userWalletBalancesMapper` - User wallet balances
- `userWalletBalancesLoading` - Loading state

**Methods:**
- `fetchLoanDetails` - Fetch loan details
- `fetchUserLoanDetails` - Fetch user details
- `fetchUserLoanWalletBalances` - Fetch balances
- `resetUserDetailsState` - Reset user state

**Used by (7 files):**
- `loan/hooks/useLoanPositionDetails.ts`
- `loan/hooks/useMarketDetails.ts`
- `loan/hooks/useUserLoanDetails.ts`
- `loan/store/createLoansSlice.ts` (self)

---

### LoanCreateSlice

**File:** `loan/store/createLoanCreateSlice.ts`

**Purpose:** Similar to LEND LoanCreateSlice

**Used by (7 files):**
- `loan/components/PageLoanCreate/index.tsx`
- `loan/components/PageLoanCreate/Page.tsx`
- `loan/components/PageLoanCreate/LoanFormCreate/index.tsx`
- `loan/components/PageLoanCreate/LoanFormCreate/components/DetailInfo.tsx`
- `loan/components/PageLoanCreate/LoanFormCreate/components/DetailInfoLeverage.tsx`
- `loan/components/PageLoanCreate/LoanFormCreate/components/DetailInfoNonLeverage.tsx`
- `loan/store/createLoanCreateSlice.ts` (self)

---

### LoanCollateralDecreaseSlice

**File:** `loan/store/createLoanCollateralDecreaseSlice.ts`

**State Properties:**
- `activeKey`, `formValues`, `formStatus`, `formEstGas`, `detailInfo`, `maxRemovable`, `init`

**Methods:**
- `setFormValues`, `fetchStepDecrease`, `setStateByKey`, `resetState`

**Used by (2 files):**
- `loan/components/PageLoanManage/CollateralDecrease/index.tsx`
- `loan/store/createLoanCollateralDecreaseSlice.ts` (self)

---

### LoanCollateralIncreaseSlice

**File:** `loan/store/createLoanCollateralIncreaseSlice.ts`

**State Properties:**
- `activeKey`, `formValues`, `formStatus`, `formEstGas`, `detailInfo`

**Methods:**
- `setFormValues`, `fetchStepApprove`, `fetchStepIncrease`, `setStateByKey`, `resetState`

**Used by (2 files):**
- `loan/components/PageLoanManage/CollateralIncrease/index.tsx`
- `loan/store/createLoanCollateralIncreaseSlice.ts` (self)

---

### LoanDecreaseSlice

**File:** `loan/store/createLoanDecreaseSlice.ts`

**State Properties:**
- `activeKey`, `formValues`, `formStatus`, `formEstGas`, `detailInfo`

**Methods:**
- `setFormValues`, `fetchStepApprove`, `fetchStepDecrease`, `setStateByKey`, `resetState`

**Used by (2 files):**
- `loan/components/PageLoanManage/LoanDecrease/index.tsx`
- `loan/store/createLoanDecreaseSlice.ts` (self)

---

### LoanDeleverageSlice

**File:** `loan/store/createLoanDeleverageSlice.ts`

**State Properties:**
- `activeKey`, `formValues`, `formStatus`, `formEstGas`, `detailInfo`

**Methods:**
- `setFormValues`, `fetchStepRepay`

**Used by (2 files):**
- `loan/components/PageLoanManage/LoanDeleverage/index.tsx`
- `loan/store/createLoanDeleverageSlice.ts` (self)

---

### LoanIncreaseSlice

**File:** `loan/store/createLoanIncreaseSlice.ts`

**State Properties:**
- `activeKey`, `formValues`, `formStatus`, `formEstGas`, `detailInfo`, `maxRecv`, `init`

**Methods:**
- `setFormValues`, `fetchStepApprove`, `fetchStepIncrease`, `setStateByKey`, `resetState`

**Used by (2 files):**
- `loan/components/PageLoanManage/LoanIncrease/index.tsx`
- `loan/store/createLoanIncreaseSlice.ts` (self)

---

### LoanLiquidateSlice

**File:** `loan/store/createLoanLiquidate.ts`

**State Properties:**
- `formStatus`, `formEstGas`, `liquidationAmt`

**Methods:**
- `fetchTokensToLiquidate`, `fetchStepApprove`, `fetchStepLiquidate`, `setStateByKey`, `resetState`

**Used by (2 files):**
- `loan/components/PageLoanManage/LoanLiquidate/index.tsx`
- `loan/store/createLoanLiquidate.ts` (self)

---

### IntegrationsSlice

**File:** `loan/store/createIntegrationsSlice.ts`

**Used by (2 files):**
- `loan/components/PageIntegrations/index.tsx`
- `loan/components/PageIntegrations/Page.tsx`
- `loan/store/createIntegrationsSlice.ts` (self)

---

### OhlcChartSlice

**File:** `loan/store/createOhlcChartSlice.ts`

**State Properties:**
- `timeOption` - Chart time option
- `chartLlammaOhlc` - LLAMMA OHLC data
- `chartOraclePoolOhlc` - Oracle pool OHLC data
- `llammaControllerData` - Controller data
- `llammaTradesData` - Trades data
- `activityFetchStatus` - Activity fetch status
- `oraclePriceVisible` - Oracle price visibility
- `liqRangeCurrentVisible` - Current liquidation range visibility
- `liqRangeNewVisible` - New liquidation range visibility

**Methods:**
- `fetchLlammaOhlcData` - Fetch LLAMMA OHLC
- `fetchOracleOhlcData` - Fetch oracle OHLC
- `fetchPoolActivity` - Fetch pool activity
- `fetchMoreData` - Fetch more data
- `setChartTimeOption` - Set time option
- `toggleOraclePriceVisible` - Toggle oracle price
- `toggleLiqRangeCurrentVisible` - Toggle current range
- `toggleLiqRangeNewVisible` - Toggle new range

**Used by (3 files):**
- `loan/components/ChartOhlcWrapper/index.tsx`
- `loan/components/ChartOhlcWrapper/PoolActivity.tsx`
- `loan/store/createOhlcChartSlice.ts` (self)

---

### ScrvUsdSlice

**File:** `loan/store/createScrvUsdSlice.ts`

**State Properties:**
- `stakingModule` - Selected staking module
- `inputAmount` - Input amount
- `scrvUsdExchangeRate` - Exchange rate
- `depositApproval` - Deposit approval data
- `preview` - Preview data
- `estimateGas` - Gas estimate
- `deploy` - Deploy data
- `depositTransaction` - Deposit tx state
- `withdrawTransaction` - Withdraw tx state
- `approveDepositTransaction` - Approval tx
- `selectedStatisticsChart` - Chart selection
- `revenueChartTimeOption` - Chart time
- `previewAction` - Preview action
- `estGas` - Gas estimate
- `approveInfinite` - Infinite approval flag

**Methods:**
- `setStakingModule` - Set staking module
- `setInputAmount` - Set input amount
- `setMax` - Set max amount
- `setApproveInfinite` - Set infinite approval
- `setSelectedStatisticsChart` - Set chart
- `setRevenueChartTimeOption` - Set chart time
- `setPreviewReset` - Reset preview
- `setTransactionsReset` - Reset transactions
- `fetchExchangeRate` - Fetch exchange rate
- `fetchCrvUsdSupplies` - Fetch supplies
- `checkApproval` - Check approval
- `getInputAmountApproved` - Get approved amount
- `getEstimateGas` - Get gas estimate
- `approveDepositTransaction` - Approve deposit
- `depositTransaction` - Execute deposit
- `withdrawTransaction` - Execute withdrawal

**Used by (15 files):**
- `loan/components/PageCrvUsdStaking/index.tsx`
- `loan/components/PageCrvUsdStaking/DepositWithdraw/index.tsx`
- `loan/components/PageCrvUsdStaking/DepositWithdraw/DepositModule.tsx`
- `loan/components/PageCrvUsdStaking/DepositWithdraw/WithdrawModule.tsx`
- `loan/components/PageCrvUsdStaking/DepositWithdraw/DeployButton.tsx`
- `loan/components/PageCrvUsdStaking/Statistics/index.tsx`
- `loan/components/PageCrvUsdStaking/UserPosition/index.tsx`
- `loan/components/PageCrvUsdStaking/TransactionTracking/index.tsx`
- `loan/components/PageCrvUsdStaking/TransactionTracking/DepositTracking.tsx`
- `loan/components/PageCrvUsdStaking/TransactionTracking/WithdrawTracking.tsx`
- `loan/components/PageCrvUsdStaking/components/TransactionDetails.tsx`
- `loan/store/createScrvUsdSlice.ts` (self)

---

---

## Unused Code Analysis

This section identifies potentially unused code that can be safely removed during the migration to TanStack Query.

### High-Priority Unused Code (Should Remove)

#### DAO Store - UserSlice

**File:** `dao/store/createUserSlice.ts`

**Unused Methods:**
- ❌ `getUserEns(userAddress: string)` - Never called anywhere in the codebase
- ❌ `setUserLocksSortBy()` - Setter method never called
- ❌ `setUserProposalVotesSortBy()` - Setter method never called
- ❌ `setUserGaugeVotesSortBy()` - Setter method never called
- ❌ `setUserGaugeVoteWeightsSortBy()` - Setter method never called

**Unused State Properties:**
- ❌ `userMapper` - Only set by the unused `getUserEns()` method, never read
- ❌ `userLocksSortBy` - Never accessed
- ❌ `userProposalVotesSortBy` - Never accessed
- ❌ `userGaugeVotesSortBy` - Never accessed
- ❌ `userGaugeVoteWeightsSortBy` - Never accessed

**Note:** All four sorting state properties and their setter methods appear to be remnants from a previous implementation. The sorting functionality has been moved to component-level state.

---

#### DAO Store - GaugesSlice

**File:** `dao/store/createGaugesSlice.ts`

**Unused Methods:**
- ❌ `setGauges(searchValue: string)` - Never called anywhere

**Unused State Properties:**
- ❌ `selectGaugeListResult` - Set by `setSelectGaugeFilterValue` but never read
- ❌ `filteringGaugesLoading` - Set during filtering operations but never consumed by UI

---

#### DAO Store - ProposalsSlice

**File:** `dao/store/createProposalsSlice.ts`

**Unused Methods:**
- ❌ `setActiveSortDirection(direction: SortDirection)` - Never called
  - Note: The `activeSortDirection` state IS read in `useProposalsList` hook, but the setter is never used

---

#### DEX Store - PoolsSlice

**File:** `dex/store/createPoolsSlice.ts`

**Unused Methods:**
- ❌ `fetchPoolCurrenciesReserves(curve, poolData)` - Defined but never called
- ❌ `setPoolIsWrapped(poolData, isWrapped)` - Never called anywhere
- ❌ `fetchPricesPoolSnapshots(chainId, poolAddress)` - Never called

**Unused State Properties:**
- ❌ `snapshotsMapper` - Only set by unused `fetchPricesPoolSnapshots()` method

---

#### DEX Store - PoolListSlice

**File:** `dex/store/createPoolListSlice.ts`

**Unused State Properties:**
- ❌ `showHideSmallPools` - Set in state but never used to control anything
  - Note: The actual hiding of small pools is controlled by `hideSmallPools` from UserProfileStore. This is duplicate/legacy state.

---

### Medium-Priority Issues (Refactoring Opportunities)

#### Duplicate Helper Methods Across All Slices

The following pattern is duplicated in EVERY slice across all 4 stores:

```typescript
setStateByActiveKey: <T>(key: StateKey, activeKey: string, value: T) => {
  if (Object.keys(get()[sliceKey][key]).length > 30) {
    get().setAppStateByKey(sliceKey, key, { [activeKey]: value })
  } else {
    get().setAppStateByActiveKey(sliceKey, key, activeKey, value)
  }
}
```

**Found in:**
- `dao/store/createUserSlice.ts`
- `dao/store/createLockedCrvSlice.ts`
- `dex/store/createUserSlice.ts`
- `dex/store/createDashboardSlice.ts`
- `dex/store/createPoolListSlice.ts`
- `dex/store/createPoolDepositSlice.ts`
- `dex/store/createPoolWithdrawSlice.ts`
- `dex/store/createPoolSwapSlice.ts`
- And many more...

**Recommendation:** Extract to a shared utility function to eliminate ~50+ lines of duplicate code.

---

#### Duplicate App Slice Implementations

All 4 domains have nearly identical app/global slice implementations:

- `dao/store/createAppSlice.ts`
- `dex/store/createGlobalSlice.ts`
- `lend/store/createAppSlice.ts`
- `loan/store/createAppSlice.ts`

All implement the same methods: `setAppStateByActiveKey`, `setAppStateByKey`, `setAppStateByKeys`, and `resetAppState` with identical logic.

**Recommendation:** Consolidate into a shared base implementation to reduce duplication.

---

### Low-Priority Issues (Technical Debt)

#### TODO Comments Indicating Incomplete Features

**DEX Store - GlobalSlice**

**File:** `dex/store/createGlobalSlice.ts` (Lines 116-117)

```typescript
// TODO: Temporary code to determine if there is an issue with getting base APY from Kava Api
```

**Issue:** Long-standing TODO suggests technical debt around Kava network handling.

---

**LOAN Store - LoansSlice**

**File:** `loan/store/createLoansSlice.ts` (Line 63)

```typescript
// TODO: handle errors
```

**Issue:** Error handling is missing in `fetchLoansDetails` method. Currently errors are only logged, not properly handled.

---

**LOAN Store - ScrvUsdSlice**

**File:** `loan/store/createScrvUsdSlice.ts` (Line 197)

```typescript
// TODO: check so curve always is set when approving
```

**Issue:** Potential null check issue that needs addressing.

---

**DAO Store - GaugesSlice**

**Potentially Redundant:**
- `getGaugesData()` method - Only called from `hydrate` in createAppSlice.ts
- The returned `gaugeCurveApiData` is only used in 2 places and may duplicate other gauge data

**Recommendation:** Verify if this data is truly needed or if it duplicates information available elsewhere.

---

## Migration Considerations

This report provides a comprehensive view of all Zustand slices and their usage across the codebase. When migrating to TanStack Query, consider:

1. **High-Impact Slices** (25+ files):
   - DEX CreatePoolSlice (25 files)
   - DEX PoolsSlice (28+ files)
   - DAO GaugesSlice (24 files)

2. **Transaction Management Slices**:
   - Most slices with `formStatus`, `formEstGas`, `fetchStep*` methods handle blockchain transactions
   - These may benefit from TanStack Query mutations with optimistic updates

3. **Data Fetching Slices**:
   - PoolsSlice, MarketsSlice, LoansSlice, GaugesSlice, AnalyticsSlice
   - Prime candidates for TanStack Query with queryFactory pattern

4. **Form State Slices**:
   - Deposit, Withdraw, Swap, Create slices
   - May be better suited for local component state or React Hook Form

5. **Cache & UI State**:
   - CacheSlice, sorting/filtering state
   - Consider keeping in Zustand or moving to URL params

6. **Cleanup Before Migration**:
   - Remove unused methods and state properties identified above
   - Consolidate duplicate helper methods
   - Address TODO comments for technical debt

---

Generated on: 2025-12-16
