/**
 * Feature flag hooks centralizing release-channel based switches.
 * These return booleans indicating whether a new experience is enabled.
 */

import { ReleaseChannel } from '@ui-kit/utils'
import { getReleaseChannel, isZapV2Disabled, useDisableZapV2, useReleaseChannel } from './useLocalStorage'

const useBetaChannel = () => useReleaseChannel()[0] === ReleaseChannel.Beta
const useStableChannel = () => useReleaseChannel()[0] !== ReleaseChannel.Legacy

/**
 * Alpha channel works like beta for preview/localhost urls, but completely hidden in production.
 * This is used for features actively under development that are known not to be ready.
 **/
// const useAlphaChannel = () => useBetaChannel() && defaultReleaseChannel === ReleaseChannel.Beta

/** New unified create loan form */
export const useCreateLoanMuiForm = useStableChannel

/** New unified supply/vault forms (deposit/withdraw/claim) */
export const useLendingMuiForm = useStableChannel

/** New manage loan forms (add/remove/repay) */
export const useManageLoanMuiForm = useStableChannel

/** New bands chart (BandsChart) */
export const useNewBandsChart = useStableChannel

/** New card for managing soft liquidations */
export const useManageSoftLiquidation = useStableChannel

/** Entire new app containing in-depth analyses for knowledgeable users */
export const useAnalyticsApp = useStableChannel

/** New ZapV2 leverage implementation for LlamaLend markets */
export const isZapV2Enabled = () => getReleaseChannel() === ReleaseChannel.Beta && !isZapV2Disabled()

const useZapV2 = () => [useBetaChannel(), !useDisableZapV2()].every(Boolean)

/** gets a key to remount components when ZapV2 is toggled, forcing calls to non-reactive isZapV2Enabled */
export const useLoanImplementationKey = () => (useZapV2() ? 'zapV2' : '')

/** New LlamaLend v2 implementation */
export const useLLv2 = useBetaChannel
export const isLLv2Enabled = (releaseChannel: ReleaseChannel) => releaseChannel === ReleaseChannel.Beta

/** New market page layout with forms on the right  */
export const useRightFormTabsLayout = useStableChannel

/** New market historical borrow and supply rate charts */
export const useMarketHistoricalRatesChart = useStableChannel

/** New market historical interest rate and utilization chart */
export const useMarketInterestRatesAndUtilizationChart = useBetaChannel

/** New market list and search layout */
export const useNewMarketListLayout = useBetaChannel
