import Stack from '@mui/material/Stack'

import { useConnectWallet, getWalletSignerAddress } from '@ui-kit/features/connect-wallet'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'

import { UserProfileHeader } from './Header'
import { Settings } from '../settings'

const { Spacing } = SizesAndSpaces

type Props = {
  onClose: () => void
}

export const Home = ({ onClose }: Props) => {
  const { wallet } = useConnectWallet()
  const walletAddress = getWalletSignerAddress(wallet)

  return (
    <Stack gap={Spacing.md}>
      <UserProfileHeader walletAddress={walletAddress} onClose={onClose} />
      <Settings />
    </Stack>
  )
}
