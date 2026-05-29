import lodash from 'lodash'
import { useEffect, useRef, useState } from 'react'
import { styled } from 'styled-components'
import { RewardCrv } from '@/dex/types/main.types'
import { rewardsApyCrvText } from '@/dex/utils/utilsCurvejs'
import { Box } from '@ui/Box'
import { formatNumber } from '@ui-kit/utils'

interface Props {
  crv?: RewardCrv[]
  userCrvApy: number
  fetchUserPoolBoost: () => Promise<string>
}

export const TableCellRewardsTooltip = ({ crv = [], userCrvApy, fetchUserPoolBoost }: Props) => {
  // eslint-disable-next-line @eslint-react/naming-convention-ref-name -- Existing violation before enabling this rule.
  const isSubscribedRef = useRef(false)
  const [boost, setBoost] = useState('')

  useEffect(() => {
    isSubscribedRef.current = true
    void (async () => {
      const fetchedBoosted = await fetchUserPoolBoost()

      if (isSubscribedRef.current) {
        setBoost(fetchedBoosted)
      }
    })()

    return () => {
      isSubscribedRef.current = false
    }
    // eslint-disable-next-line @eslint-react/exhaustive-deps
  }, [])

  return (
    <Box grid gridRowGap={1}>
      <Title>CRV tAPR</Title>
      <div>Min/max: {rewardsApyCrvText(crv)}</div>
      <div>Your: {formatNumber(userCrvApy, { unit: 'percentage', abbreviate: false })}</div>
      <div>Boost: {boost ? `${lodash.round(+boost, 2)}x` : '-'}</div>
    </Box>
  )
}

const Title = styled.div`
  font-weight: bold;
`
