/**
 * Feature flag hooks centralizing release-channel based switches.
 * These return booleans indicating whether a new experience is enabled.
 */

import { isCypress, ReleaseChannel } from '@ui-kit/utils'
import { useReleaseChannel } from './useLocalStorage'

/**
 * LargeTokenInput replaces legacy amount inputs when not on Legacy channel.
 */
export const useLargeTokenInput = () => useReleaseChannel()[0] === ReleaseChannel.Beta

/**
 * New ActionInfo with mui should be released together with LargeTokenInput.
 */
export const useActionInfo = useLargeTokenInput

/**
 * New DEX market list (PoolListPage) is enabled on Beta channel.
 */
export const useDexMarketList = () => useReleaseChannel()[0] === ReleaseChannel.Beta

/**
 * New unified borrow form (BorrowTabContents) is enabled on Beta channel.
 * Exposed for convenience when migrating create/leverage pages.
 */
export const useBorrowUnifiedForm = () => useReleaseChannel()[0] === ReleaseChannel.Beta

/**
 * New user profile button is enabled on Beta channel and disabled during Cypress tests.
 * TODO: update cypress tests to support UserProfileButton
 */
export const useUserProfileButton = () => useReleaseChannel()[0] !== ReleaseChannel.Legacy && !isCypress
