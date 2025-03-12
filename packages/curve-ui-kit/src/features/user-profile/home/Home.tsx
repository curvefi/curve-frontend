import Stack from '@mui/material/Stack'
import { getWalletSignerAddress, useWallet } from '@ui-kit/features/connect-wallet'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Settings } from '../settings'
import { UserProfileHeader } from './Header'

const { Spacing } = SizesAndSpaces

type Props = {
  onClose: () => void
}

export const Home = ({ onClose }: Props) => {
  const { wallet } = useWallet()
  const walletAddress = getWalletSignerAddress(wallet)

  return (
    <Stack gap={Spacing.md}>
      <UserProfileHeader walletAddress={walletAddress} onClose={onClose} />
      <Settings />
    </Stack>
  )
}
