/**
 * Feature flag hooks centralizing release-channel based switches.
 * These return booleans indicating whether a new experience is enabled.
 */

import { defaultReleaseChannel, ReleaseChannel } from '@ui-kit/utils'
import { useReleaseChannel } from './useLocalStorage'

const useBetaChannel = () => useReleaseChannel()[0] === ReleaseChannel.Beta
const useStableChannel = () => useReleaseChannel()[0] !== ReleaseChannel.Legacy

/**
 * Pre-Beta channel works like beta for preview/localhost urls, but completely hidden in production.
 * This is used for features actively under development that are known not to be ready.
 *  */
const useAlphaChannel = () => useBetaChannel() && defaultReleaseChannel === ReleaseChannel.Beta

/** LargeTokenInput replaces legacy amount inputs */
export const useLargeTokenInput = useStableChannel

/** LargeTokenInput specifically for scrvUSD page, was implemented after the rest */
export const useLargeTokenInputScrvusd = useBetaChannel

/** Negation of useLargeTokenInput for readability. */
export const useLegacyTokenInput = () => !useLargeTokenInput()

/** New DEX market list (PoolListPage) */
export const useDexMarketList = useBetaChannel

/** New unified create loan form */
export const useCreateLoanMuiForm = useBetaChannel

/** New manage loan forms (add/remove/repay) */
export const useManageLoanMuiForm = useAlphaChannel

/** New bands chart (BandsChart) */
export const useNewBandsChart = useBetaChannel

/** New card for managing soft liquidations */
export const useManageSoftLiquidation = useAlphaChannel

/** Entire new app containing in-depth analyses for knowledgeable users */
export const useAnalyticsApp = useAlphaChannel
