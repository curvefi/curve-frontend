import type { Seed } from '@/dex/components/PagePool/types'

import React, { useCallback, useEffect, useState } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { formatNumber } from '@ui/utils'

import AlertBox from '@ui/AlertBox'

type Props = {
  seed: Seed
  poolData: PoolData | undefined
}

const AlertSeedAmounts = ({ seed, poolData }: Props) => {
  const [seedAmounts, setSeedAmounts] = useState<string[]>([])

  const { isSeed, loaded } = seed

  const getSeedRatio = useCallback(async (poolData: PoolData) => {
    try {
      const { pool, hasWrapped } = poolData

      const tokens = hasWrapped ? pool.wrappedCoins : pool.underlyingCoins
      const useUnderlying = !hasWrapped

      const seedAmounts = await pool.getSeedAmounts('1', useUnderlying)

      setSeedAmounts(
        tokens.map((token, idx) => `${formatNumber(seedAmounts[idx], { showAllFractionDigits: true })} ${token}`),
      )
    } catch (error) {
      console.error(error)
    }
  }, [])

  useEffect(() => {
    if (!!poolData && loaded && isSeed) getSeedRatio(poolData)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poolData?.pool?.id, loaded, isSeed])

  const seedAmountsLength = seedAmounts.length

  return (
    <>
      {isSeed && seedAmountsLength > 0 && (
        <AlertBox alertType="error">
          <div>
            <p>
              {seedAmountsLength === 2 &&
                t`This pool is empty. Assuming you are adding ${seedAmounts[0]}, the equivalent amount of the other token should be ${seedAmounts[1]}.`}
              {seedAmountsLength !== 2 &&
                t`This pool is empty. Assuming you are adding ${seedAmounts[0]}, the equivalent amounts of the other tokens should be:`}
            </p>
            {seedAmountsLength !== 2 && (
              <StyledSeedAmounts>
                {seedAmounts.map((seedAmount, idx) => {
                  if (idx === 0) return null
                  return <StyledSeedAmount key={seedAmount}>{seedAmount}</StyledSeedAmount>
                })}
              </StyledSeedAmounts>
            )}
          </div>
        </AlertBox>
      )}
    </>
  )
}

const StyledSeedAmounts = styled.ul`
  margin-top: var(--spacing-2);
`

const StyledSeedAmount = styled.li`
  list-style: disc;
  margin-left: var(--spacing-normal);
  margin-bottom: var(--spacing-1);
`

export default AlertSeedAmounts
