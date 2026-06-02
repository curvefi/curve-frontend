import type { Address } from '@primitives/address.utils'

/** Represents a token that should be blacklisted from token selection. */
type BlacklistEntry = {
  /** The contract address of the blacklisted token */
  address: Address
  /** Optional reason explaining why the token is blacklisted */
  reason?: string
}

/**
 * List of tokens that should be blacklisted from any token selection modal.
 *
 * Due to regulatory concerns, certain tokens need to be disabled in token selection.
 * Blacklisted tokens will be shown as disabled with a tooltip explaining they are
 * blacklisted, rather than being hidden entirely to prevent user confusion.
 *
 * We considered allowing blacklisted tokens as 'from' tokens to enable users to exit positions,
 * but opted for a simpler approach with a uniform blacklist for now.
 *
 * Note: This is not the most decentralized or scalable solution, but immediate
 * regulatory compliance means there's not much time for debate.
 */
export const blacklist: BlacklistEntry[] = [
  {
    address: '0x0D57436F2d39c0664C6f0f2E349229483f87EA38', // A7A5 token
    reason: 'Adverse media detected',
  },
]
