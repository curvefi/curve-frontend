import type { ChipProps } from '@/ui/Typography/types'

import React from 'react'
import styled from 'styled-components'

import { INVALID_ADDRESS } from '@/constants'
import { breakpoints, FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import Chip from '@/ui/Typography/Chip'
import ChipInactive from '@/components/ChipInactive'

const CellRewards = ({
  rChainId,
  rOwmId,
  type,
  ...props
}: ChipProps & {
  rChainId: ChainId
  rOwmId: string
  type: 'crv-other'
}) => {
  const owmData = useStore((state) => state.markets.owmDatasMapper[rChainId]?.[rOwmId])
  const resp = useStore((state) => state.markets.rewardsMapper[rChainId]?.[rOwmId])

  const { gauge } = owmData?.owm?.addresses ?? {}
  const { rewards, error } = resp ?? {}
  const { crv, other } = rewards ?? {}
  const [crvBase, crvBoosted] = crv ?? []

  const invalidGaugeAddress = typeof gauge !== 'undefined' && gauge === INVALID_ADDRESS
  const haveCrvBase = typeof crvBase !== 'undefined' && +crvBase > 0
  const haveCrvBoosted = typeof crvBoosted !== 'undefined' && +crvBoosted > 0
  const haveRewards = typeof other !== 'undefined' && other.length > 0

  return (
    <span>
      {typeof owmData === 'undefined' ? null : error ? (
        '?'
      ) : invalidGaugeAddress ? (
        <ChipInactive>No gauge</ChipInactive>
      ) : type === 'crv-other' ? (
        haveCrvBase || haveCrvBoosted || haveRewards ? (
          <CrvRewardsWrapper>
            {(haveCrvBase || haveCrvBoosted) && (
              <Chip {...props}>
                {formatNumber(crvBase, { ...FORMAT_OPTIONS.PERCENT, defaultValue: '-' })}{' '}
                {haveCrvBoosted && ` → ${formatNumber(crvBoosted, { ...FORMAT_OPTIONS.PERCENT, defaultValue: '-' })}`}{' '}
                CRV
              </Chip>
            )}
            {rewards?.other.map(({ symbol, apy }) => {
              return (
                <Chip key={symbol} {...props}>
                  {formatNumber(apy, { ...FORMAT_OPTIONS.PERCENT, defaultValue: '-' })} {symbol}
                </Chip>
              )
            })}
          </CrvRewardsWrapper>
        ) : (
          '0%'
        )
      ) : null}
    </span>
  )
}

const CrvRewardsWrapper = styled.div`
  display: grid;
  text-align: left;

  @media (min-width: ${breakpoints.sm}rem) {
    grid-gap: var(--spacing-2);
    text-align: right;
  }
`

export default CellRewards
