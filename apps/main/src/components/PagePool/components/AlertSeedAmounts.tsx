import React, { useMemo } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { formatNumber } from '@/ui/utils'
import { usePoolContext } from '@/components/PagePool/contextPool'
import { usePoolSeedAmounts } from '@/entities/pool'

import AlertBox from '@/ui/AlertBox'

const AlertSeedAmounts: React.FC = () => {
  const { isWrapped, isSeed, poolBaseKeys } = usePoolContext()

  const { data: seedAmounts } = usePoolSeedAmounts({
    ...poolBaseKeys,
    firstAmount: '1',
    isSeed,
    useUnderlying: !isWrapped,
  })

  const parsedSeedAmounts = useMemo(() => {
    if (!seedAmounts) return []
    return seedAmounts.map(({ token, amount }) => `${formatNumber(amount, { showAllFractionDigits: true })} ${token}`)
  }, [seedAmounts])

  const seedAmountsLength = parsedSeedAmounts.length

  return (
    <>
      {isSeed && seedAmountsLength > 0 && (
        <AlertBox alertType="error">
          <div>
            <p>
              {seedAmountsLength === 2 &&
                t`This pool is empty. Assuming you are adding ${parsedSeedAmounts[0]}, the equivalent amount of the other token should be ${parsedSeedAmounts[1]}.`}
              {seedAmountsLength !== 2 &&
                t`This pool is empty. Assuming you are adding ${parsedSeedAmounts[0]}, the equivalent amounts of the other tokens should be:`}
            </p>
            {seedAmountsLength !== 2 && (
              <StyledSeedAmounts>
                {parsedSeedAmounts.map((seedAmount, idx) => {
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
