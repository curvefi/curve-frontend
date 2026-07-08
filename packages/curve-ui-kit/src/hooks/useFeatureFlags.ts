/**
 * Feature flag hooks centralizing release-channel based switches.
 * These return booleans indicating whether a new experience is enabled.
 */

import { defaultReleaseChannel, ReleaseChannel } from '@ui-kit/utils'
import { useCurrentDate } from './useCurrentDate'
import { useReleaseChannel } from './useLocalStorage'

const useBetaChannel = () => useReleaseChannel()[0] === ReleaseChannel.Beta
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useStableChannel = () => useReleaseChannel()[0] !== ReleaseChannel.Legacy
const LLV2_STABLE_RELEASE_DATE = new Date('2026-06-10T13:00:00Z') // 15:00 CEST

/**
 * Alpha channel works like beta for preview/localhost urls, but completely hidden in production.
 * This is used for features actively under development that are known not to be ready.
 **/
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useAlphaChannel = () => useBetaChannel() && defaultReleaseChannel === ReleaseChannel.Beta

/** New LlamaLend v2 implementation */
export const useLLv2 = () => {
  const [releaseChannel] = useReleaseChannel()
  const currentDate = useCurrentDate()
  return (
    releaseChannel === ReleaseChannel.Beta ||
    (releaseChannel === ReleaseChannel.Stable && currentDate >= LLV2_STABLE_RELEASE_DATE)
  )
}

export const use0xRouter = useBetaChannel

/** Reset position form for LlamaLend soft liquidation */
export const useLlamaResetPosition = useBetaChannel

/** Split the LlamaLend (soon to be legacy) health into: Liquidation Buffer and Health */
export const useNewLlamalendHealth = useBetaChannel

/** Mobile LlamaLend market forms open from a fixed action bar into a drawer */
export const useLlamalendMobileFormDrawer = useBetaChannel

/** New DEX pool list backed by Prices API v2 */
export const useDexPoolListV2 = useBetaChannel

export const isDexPoolListV2Enabled = (releaseChannel: ReleaseChannel) => releaseChannel === ReleaseChannel.Beta
