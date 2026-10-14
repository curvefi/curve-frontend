import { WrongNetwork } from '@/dao/components/PageVeCrv/WrongNetwork'
import { useCurve } from '@evm-ui/features/connect-wallet'
import { ConnectWalletPrompt } from '@evm-ui/features/connect-wallet/ui/ConnectWalletPrompt'
import Box from '@mui/material/Box'
import { Chain } from '@primitives/network.utils'
import { CurrentVotes } from './CurrentVotes'

export const GaugeVoting = () => {
  const { provider, curveApi: { chainId } = {} } = useCurve()
  if (chainId !== Chain.Ethereum) {
    return <WrongNetwork />
  }
  if (!provider) {
    return <ConnectWalletPrompt description="Connect your wallet to view your current votes and vote on gauges" />
  }
  return (
    <Box sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>
      <CurrentVotes />
    </Box>
  )
}
