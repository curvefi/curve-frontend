/**
 * Feature flag hooks centralizing release-channel based switches.
 * These return booleans indicating whether a new experience is enabled.
 */

import { ReleaseChannel } from '@ui-kit/utils'
import { useReleaseChannel } from './useLocalStorage'

const useBetaChannel = () => useReleaseChannel()[0] === ReleaseChannel.Beta
const useStableChannel = () => useReleaseChannel()[0] !== ReleaseChannel.Legacy

/** LargeTokenInput replaces legacy amount inputs */
const useLargeTokenInput = useBetaChannel

/** Negation of useLargeTokenInput for readability. */
export const useLegacyTokenInput = () => !useLargeTokenInput()

/** New ActionInfo with mui should be released together with LargeTokenInput. */
export const useActionInfo = useBetaChannel

/** New DEX market list (PoolListPage) */
export const useDexMarketList = useBetaChannel

/** New unified borrow form (BorrowTabContents) */
export const useBorrowUnifiedForm = useBetaChannel

/** New user profile button on the header */
export const useUserProfileButton = useStableChannel
