import React from 'react'

import useStore from '@/store/useStore'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import Chip from '@/ui/Typography/Chip'

const SMALL_NUMBER = 0.0001

const CellLoss = ({ userActiveKey, type }: { userActiveKey: string; type: 'amount' | 'percent' }) => {
  const resp = useStore((state) => state.user.loansDetailsMapper[userActiveKey])

  const { details, error } = resp ?? {}
  const { loss, loss_pct } = details?.loss ?? {}

  return (
    <>
      {error ? (
        '?'
      ) : !details ? (
        '-'
      ) : type === 'amount' ? (
        <>
          {Number(loss) <= SMALL_NUMBER && Number(loss) !== 0 ? (
            <Chip tooltip={loss}>{`<${SMALL_NUMBER}`}</Chip>
          ) : (
            formatNumber(loss)
          )}
        </>
      ) : type === 'percent' ? (
        <>
          {Number(loss_pct) <= SMALL_NUMBER && Number(loss) !== 0 ? (
            <Chip tooltip={loss_pct}>{`<${SMALL_NUMBER}%`}</Chip>
          ) : (
            formatNumber(loss_pct, { ...FORMAT_OPTIONS.PERCENT, defaultValue: '-' })
          )}
        </>
      ) : null}
    </>
  )
}

export default CellLoss
