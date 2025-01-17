import Box from '@ui/Box'
import useStore from '@lend/store/useStore'

import { formatNumber } from '@ui/utils'

const DetailsUserSupplyStakedUnstaked = ({ userActiveKey }: { userActiveKey: string }) => {
  const userBalancesResp = useStore((state) => state.user.marketsBalancesMapper[userActiveKey])

  const { gauge, vaultShares } = userBalancesResp ?? {}

  return (
    <Box grid>
      <div>
        Staked: <strong>{formatNumber(gauge)}</strong>
      </div>
      <div>
        Unstaked: <strong>{formatNumber(vaultShares)}</strong>
      </div>
    </Box>
  )
}

export default DetailsUserSupplyStakedUnstaked
