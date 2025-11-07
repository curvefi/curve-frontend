import lodash from 'lodash'
import { useEffect, useRef, useState } from 'react'
import { styled } from 'styled-components'
import { RewardCrv } from '@/dex/types/main.types'
import { rewardsApyCrvText } from '@/dex/utils/utilsCurvejs'
import Box from '@ui/Box'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { errorFallback } from '@ui-kit/utils/error.util'

type Props = {
  crv?: RewardCrv[]
  userCrvApy: number
  fetchUserPoolBoost: () => Promise<string>
}

const TableCellRewardsTooltip = ({ crv = [], userCrvApy, fetchUserPoolBoost }: Props) => {
  const isSubscribed = useRef(false)
  const [boost, setBoost] = useState('')

  useEffect(() => {
    isSubscribed.current = true
    ;(async () => {
      const fetchedBoosted = await fetchUserPoolBoost()

      if (isSubscribed.current) {
        setBoost(fetchedBoosted)
      }
    })().catch(errorFallback)

    return () => {
      isSubscribed.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <Box grid gridRowGap={1}>
      <Title>CRV tAPR</Title>
      <div>Min/max: {rewardsApyCrvText(crv)}</div>
      <div>Your: {formatNumber(userCrvApy, FORMAT_OPTIONS.PERCENT)}</div>
      <div>Boost: {boost ? `${lodash.round(+boost, 2)}x` : '-'}</div>
    </Box>
  )
}

const Title = styled.div`
  font-weight: bold;
`

export default TableCellRewardsTooltip
