import { WrongNetwork } from '@/dao/components/PageVeCrv/WrongNetwork'
import type { ChainId } from '@/dao/types/dao.types'
import { ConnectWalletPrompt, useCurve } from '@evm-ui/features/connect-wallet'
import { Chain } from '@evm-ui/utils'
import Box from '@mui/material/Box'
import { CurrentVotes } from './CurrentVotes'

export const GaugeVoting = ({ chainId }: { chainId: ChainId }) => {
  const { provider, curveApi } = useCurve()
  if (curveApi?.chainId !== chainId || chainId !== +Chain.Ethereum) {
    return <WrongNetwork />
  }
  if (!provider) {
    return <ConnectWalletPrompt description="Connect your wallet to view your current votes and vote on gauges" />
  }
  return (
    <Box sx={{ backgroundColor: t => t.design.Layer[1].Fill }}>
      <CurrentVotes chainId={chainId} />
    </Box>
  )
}
