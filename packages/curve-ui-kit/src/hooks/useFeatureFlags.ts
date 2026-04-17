/**
 * Feature flag hooks centralizing release-channel based switches.
 * These return booleans indicating whether a new experience is enabled.
 */

import { defaultReleaseChannel, ReleaseChannel } from '@ui-kit/utils'
import { getReleaseChannel, useReleaseChannel, useTryNewLlamalend } from './useLocalStorage'

const useBetaChannel = () => useReleaseChannel()[0] === ReleaseChannel.Beta
const useStableChannel = () => useReleaseChannel()[0] !== ReleaseChannel.Legacy

/**
 * Alpha channel works like beta for preview/localhost urls, but completely hidden in production.
 * This is used for features actively under development that are known not to be ready.
 *  */
const isAlpha = () => getReleaseChannel() === ReleaseChannel.Beta && defaultReleaseChannel === ReleaseChannel.Beta
// const useAlphaChannel = () => useBetaChannel() && defaultReleaseChannel === ReleaseChannel.Beta

/** New manage loan forms (add/remove/repay) */
export const useManageLoanMuiForm = () => [useBetaChannel(), useTryNewLlamalend()[0]].some(Boolean)

/** New unified supply/vault forms (deposit/withdraw/claim) */
export const useLendingMuiForm = useManageLoanMuiForm

/** New card for managing soft liquidations */
export const useManageSoftLiquidation = useManageLoanMuiForm

/** New market page layout with forms on the right  */
export const useRightFormTabsLayout = useManageLoanMuiForm

/** New bands chart (BandsChart) */
export const useNewBandsChart = useBetaChannel

/** Entire new app containing in-depth analyses for knowledgeable users */
export const useAnalyticsApp = useStableChannel

/** New ZapV2 leverage implementation for LlamaLend markets */
export const isZapV2Enabled = () => isAlpha() && localStorage.getItem('disableZapV2') != 'true'

/** New LlamaLend v2 implementation */
export const useLLv2 = useBetaChannel
export const isLLv2Enabled = (releaseChannel: ReleaseChannel) => releaseChannel === ReleaseChannel.Beta

/** New market historical rates chart */
export const useMarketHistoricalRatesChart = useBetaChannel
