import { t } from '@lingui/macro'

import { formatNumber } from '@ui/utils'
import { weiToEther } from '@ui-kit/utils'
import usePoolTotalStaked from '@/dex/hooks/usePoolTotalStaked'
import Item from '@ui/Items/Item'
import Items from '@ui/Items/Items'

interface PoolTotalStakedProps {
  poolDataCacheOrApi: PoolDataCacheOrApi
}

const PoolTotalStaked: React.FC<PoolTotalStakedProps> = ({ poolDataCacheOrApi }) => {
  const staked = usePoolTotalStaked(poolDataCacheOrApi)

  return (
    <article>
      <Items listItemMargin="var(--spacing-1)">
        <Item>
          {t`Total LP Tokens staked:`}{' '}
          <strong>
            {typeof staked?.gaugeTotalSupply === 'string'
              ? staked.gaugeTotalSupply
              : formatNumber(staked?.gaugeTotalSupply ? weiToEther(Number(staked.gaugeTotalSupply)) : undefined, {
                  notation: 'compact',
                  defaultValue: '-',
                })}
          </strong>
        </Item>
        <Item>
          {t`Staked percent`}:{' '}
          <strong>
            {typeof staked?.totalStakedPercent === 'string'
              ? staked.totalStakedPercent
              : formatNumber(staked?.totalStakedPercent, { style: 'percent', defaultValue: '-' })}
          </strong>
        </Item>
      </Items>
    </article>
  )
}

export default PoolTotalStaked
