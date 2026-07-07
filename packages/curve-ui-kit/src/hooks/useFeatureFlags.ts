/**
 * Feature flag hooks centralizing release-channel based switches.
 * These return booleans indicating whether a new experience is enabled.
 */

import { defaultReleaseChannel, ReleaseChannel } from '@ui-kit/utils'
import { useReleaseChannel } from './useLocalStorage'

const useBetaChannel = () => useReleaseChannel()[0] === ReleaseChannel.Beta
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStableChannel = () => useReleaseChannel()[0] !== ReleaseChannel.Legacy

/**
 * Alpha channel works like beta for preview/localhost urls, but completely hidden in production.
 * This is used for features actively under development that are known not to be ready.
 **/
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useAlphaChannel = () => useBetaChannel() && defaultReleaseChannel === ReleaseChannel.Beta

export const use0xRouter = useBetaChannel

/** Reset position form for LlamaLend soft liquidation */
export const useLlamaResetPosition = useBetaChannel

/** Split the LlamaLend (soon to be legacy) health into: Liquidation Buffer and Health */
export const useNewLlamalendHealth = useBetaChannel

/** New DEX pool list backed by Prices API v2 */
export const useDexPoolListV2 = useBetaChannel

export const isDexPoolListV2Enabled = (releaseChannel: ReleaseChannel) => releaseChannel === ReleaseChannel.Beta
