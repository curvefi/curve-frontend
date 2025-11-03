import { isCypress, ReleaseChannel } from '@ui-kit/utils'
import { useReleaseChannel } from './useLocalStorage'

/**
 * Feature flag hooks centralizing release-channel based switches.
 * These return booleans indicating whether a new experience is enabled.
 */

/**
 * LargeTokenInput replaces legacy amount inputs when not on Legacy channel.
 */
export const useLargeTokenInput = () => useReleaseChannel()[0] !== ReleaseChannel.Legacy

/**
 * New ActionInfo-based UI patterns enabled on Beta channel.
 */
export const useActionInfo = () => useReleaseChannel()[0] === ReleaseChannel.Beta

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
