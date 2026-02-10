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

/** New DEX market list (PoolListPage) */
export const useDexMarketList = useBetaChannel

/** New unified create loan form */
export const useCreateLoanMuiForm = useStableChannel

/** New unified supply/vault forms (deposit/withdraw/claim) */
export const useLendingMuiForm = useBetaChannel

/** New manage loan forms (add/remove/repay) */
export const useManageLoanMuiForm = useBetaChannel

/** New bands chart (BandsChart) */
export const useNewBandsChart = useBetaChannel

/** New card for managing soft liquidations */
export const useManageSoftLiquidation = useAlphaChannel

/** Entire new app containing in-depth analyses for knowledgeable users */
export const useAnalyticsApp = useAlphaChannel

/** New page header with market metrics on market detail pages */
export const useMarketPageHeader = useBetaChannel
