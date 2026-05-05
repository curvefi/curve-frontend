import { WrongNetwork } from '@/dao/components/PageVeCrv/WrongNetwork'
import Box from '@mui/material/Box'
import { ConnectWalletPrompt, useCurve } from '@ui-kit/features/connect-wallet'
import { Chain } from '@ui-kit/utils'
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
