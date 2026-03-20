/**
 * Feature flag hooks centralizing release-channel based switches.
 * These return booleans indicating whether a new experience is enabled.
 */

import { defaultReleaseChannel, ReleaseChannel } from '@ui-kit/utils'
import { getReleaseChannel, useReleaseChannel } from './useLocalStorage'

const useBetaChannel = () => useReleaseChannel()[0] === ReleaseChannel.Beta
const useStableChannel = () => useReleaseChannel()[0] !== ReleaseChannel.Legacy

/**
 * Pre-Beta channel works like beta for preview/localhost urls, but completely hidden in production.
 * This is used for features actively under development that are known not to be ready.
 *  */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useAlphaChannel = () => useBetaChannel() && defaultReleaseChannel === ReleaseChannel.Beta

/** New unified create loan form */
export const useCreateLoanMuiForm = useStableChannel

/** New unified supply/vault forms (deposit/withdraw/claim) */
export const useLendingMuiForm = useBetaChannel

/** New manage loan forms (add/remove/repay) */
export const useManageLoanMuiForm = useBetaChannel

/** New bands chart (BandsChart) */
export const useNewBandsChart = useBetaChannel

/** New card for managing soft liquidations */
export const useManageSoftLiquidation = useBetaChannel

/** Entire new app containing in-depth analyses for knowledgeable users */
export const useAnalyticsApp = useStableChannel

/** New ZapV2 leverage implementation for LlamaLend markets */
export const isZapV2Enabled = () =>
  getReleaseChannel() === ReleaseChannel.Beta && defaultReleaseChannel === ReleaseChannel.Beta

/** New market page layout with forms on the right  */
export const useRightFormTabsLayout = useBetaChannel

/** New market historical rates chart */
export const useMarketHistoricalRatesChart = useBetaChannel
