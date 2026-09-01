/**
 * Feature flag hooks centralizing release-channel based switches.
 * These return booleans indicating whether a new experience is enabled.
 */

import { defaultReleaseChannel, ReleaseChannel } from '@evm-ui/utils'
import { useReleaseChannel } from './useLocalStorage'

const isBetaChannel = (releaseChannel: ReleaseChannel) => releaseChannel === ReleaseChannel.Beta
const useBetaChannel = () => isBetaChannel(useReleaseChannel()[0])

const useStableChannel = () => useReleaseChannel()[0] !== ReleaseChannel.Legacy

/**
 * Alpha channel works like beta for preview/localhost urls, but completely hidden in production.
 * This is used for features actively under development that are known not to be ready.
 **/
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useAlphaChannel = () => useBetaChannel() && defaultReleaseChannel === ReleaseChannel.Beta

/** Reset position form for LlamaLend soft liquidation */
export const useMarketResetPosition = useStableChannel

/** Split the LlamaLend (soon to be legacy) health into: Liquidation Buffer and Health */
export const useNewLlamalendHealth = useBetaChannel

/** New llamaLend market detail page layout preview */
export const useNewLlamaMarketDetailPage = useBetaChannel

/** Mobile LlamaLend market forms open from a fixed action bar into a drawer */
export const useMarketMobileFormDrawer = useBetaChannel

/** New DEX pool list backed by Prices API v2 */
export const useDexPoolListV2 = useStableChannel

export const isDexPoolListV2Enabled = (releaseChannel: ReleaseChannel) => releaseChannel === ReleaseChannel.Beta
