import { useCallback, useEffect, useState } from 'react'
import { styled } from 'styled-components'
import type { Seed } from '@/dex/components/PagePool/types'
import { usePoolContext } from '@/dex/features/pool-context'
import { hasWrapped } from '@/dex/pool.utils'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { AlertBox } from '@legacy-ui/AlertBox'
import { formatNumber } from '@primitives/number.utils'
import { amount } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'

export const AlertSeedAmounts = ({ seed }: { seed: Seed }) => {
  const { pool } = usePoolContext()
  const [seedAmounts, setSeedAmounts] = useState<string[]>([])

  const { isSeed, loaded } = seed

  const getSeedRatio = useCallback(async (pool: PoolTemplate) => {
    try {
      const tokens = hasWrapped(pool) ? pool.wrappedCoins : pool.underlyingCoins
      const useUnderlying = !hasWrapped(pool)

      const seedAmounts = await pool.getSeedAmounts('1', useUnderlying)

      setSeedAmounts(
        tokens.map(
          (token, idx) =>
            `${formatNumber(amount(seedAmounts[idx]), { decimals: 5, abbreviate: false, fallback: '-' })} ${token}`,
        ),
      )
    } catch (error) {
      console.error(error)
    }
  }, [])

  useEffect(() => {
    if (!!pool && loaded && isSeed) void getSeedRatio(pool)
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [pool?.id, loaded, isSeed])

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
