import type { UserProfileState } from '@ui-kit/features/user-profile/store'

const smallPoolsProfile = {
  state: {
    theme: 'light',
    maxSlippage: { crypto: '0.1', stable: '0.03' },
    isAdvancedMode: true,
    hideSmallPools: false,
  },
  version: 1,
} satisfies {
  version: number
  state: UserProfileState
}

export const setShowSmallPools = (localStorage: Storage) =>
  localStorage.setItem('user-profile', JSON.stringify(smallPoolsProfile))
