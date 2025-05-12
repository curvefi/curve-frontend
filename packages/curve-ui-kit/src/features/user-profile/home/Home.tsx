import { useAccount } from 'wagmi'
import Stack from '@mui/material/Stack'
import { SizesAndSpaces } from '@ui-kit/themes/design/1_sizes_spaces'
import { Settings } from '../settings'
import { UserProfileHeader } from './Header'

const { Spacing } = SizesAndSpaces

type Props = {
  onClose: () => void
}

export const Home = ({ onClose }: Props) => {
  const { address: walletAddress } = useAccount()

  return (
    <Stack gap={Spacing.md}>
      <UserProfileHeader walletAddress={walletAddress} onClose={onClose} />
      <Settings />
    </Stack>
  )
}
