import React from 'react'
import { t } from '@lingui/macro'

import { formatNumber } from '@/ui/utils'
import { weiToEther } from '@/shared/curve-lib'
import usePoolTotalStaked from '@/hooks/usePoolTotalStaked'
import Item from '@/ui/Items/Item'
import Items from '@/ui/Items/Items'

interface PoolTotalStakedProps {
  pool: Pool | undefined
}

const PoolTotalStaked: React.FC<PoolTotalStakedProps> = ({ pool }) => {
  const staked = usePoolTotalStaked(pool)

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
