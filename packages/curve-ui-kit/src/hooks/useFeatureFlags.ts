/**
 * Feature flag hooks centralizing release-channel based switches.
 * These return booleans indicating whether a new experience is enabled.
 */

import { ReleaseChannel } from '@ui-kit/utils'
import { useReleaseChannel } from './useLocalStorage'

const useBetaChannel = () => useReleaseChannel()[0] === ReleaseChannel.Beta
const useStableChannel = () => useReleaseChannel()[0] !== ReleaseChannel.Legacy

/**
 * LargeTokenInput replaces legacy amount inputs when on Beta channel.
 */
export const useLargeTokenInput = useBetaChannel
export const useLegacyTokenInput = () => !useLargeTokenInput()

/**
 * New ActionInfo with mui should be released together with LargeTokenInput.
 */
export const useActionInfo = useBetaChannel

/**
 * New DEX market list (PoolListPage) is enabled on Beta channel.
 */
export const useDexMarketList = useBetaChannel

/**
 * New unified borrow form (BorrowTabContents) is enabled on Beta channel.
 * Exposed for convenience when migrating create/leverage pages.
 */
export const useBorrowUnifiedForm = useBetaChannel

/**
 * The user profile button is enabled on the stable channel.
 */
export const useUserProfileButton = useStableChannel
