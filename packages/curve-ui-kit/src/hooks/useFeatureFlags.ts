/**
 * Feature flag hooks centralizing release-channel based switches.
 * These return booleans indicating whether a new experience is enabled.
 */

import { defaultReleaseChannel, ReleaseChannel } from '@ui-kit/utils'
import { useCurrentDate } from './useCurrentDate'
import { getReleaseChannel, isZapV2Disabled, useDisableZapV2, useReleaseChannel } from './useLocalStorage'

const useBetaChannel = () => useReleaseChannel()[0] === ReleaseChannel.Beta
const useStableChannel = () => useReleaseChannel()[0] !== ReleaseChannel.Legacy
const LLV2_STABLE_RELEASE_DATE = new Date('2026-06-10T13:00:00Z') // 15:00 CEST

/**
 * Alpha channel works like beta for preview/localhost urls, but completely hidden in production.
 * This is used for features actively under development that are known not to be ready.
 **/
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const useAlphaChannel = () => useBetaChannel() && defaultReleaseChannel === ReleaseChannel.Beta

/** New ZapV2 leverage implementation for LlamaLend markets */
export const isZapV2Enabled = () => getReleaseChannel() === ReleaseChannel.Beta && !isZapV2Disabled()

const useZapV2 = () => [useStableChannel(), !useDisableZapV2()].every(Boolean)

/** gets a key to remount components when ZapV2 is toggled, forcing calls to non-reactive isZapV2Enabled */
export const useLoanImplementationKey = () => (useZapV2() ? 'zapV2' : '')

/** New LlamaLend v2 implementation */
export const useLLv2 = () => {
  const [releaseChannel] = useReleaseChannel()
  const currentDate = useCurrentDate()
  return (
    releaseChannel === ReleaseChannel.Beta ||
    (releaseChannel === ReleaseChannel.Stable && currentDate >= LLV2_STABLE_RELEASE_DATE)
  )
}

/** New market list and search layout */
export const useNewMarketListLayout = useStableChannel

/** Fresh pool page experience */
export const usePoolFreshup = useBetaChannel
