import { WrongNetwork } from '@/dao/components/PageVeCrv/WrongNetwork'
import { ConnectWalletPrompt, useCurve } from '@evm-ui/features/connect-wallet'
import { Chain } from '@evm-ui/utils'
import Box from '@mui/material/Box'
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
