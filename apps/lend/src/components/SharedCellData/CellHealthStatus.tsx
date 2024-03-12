import { useMemo } from 'react'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import { HealthColorText } from '@/components/DetailsUser/styles'

const CellHealthStatus = ({
  healthPercent,
  userActiveKey,
  type,
}: {
  healthPercent: string
  userActiveKey: string
  type: 'status' | 'percent'
}) => {
  const resp = useStore((state) => state.user.loansDetailsMapper[userActiveKey])

  const { details, error } = resp ?? {}

  const parsedHealthModePercent = useMemo(() => {
    if (type === 'percent' && healthPercent) {
      return Number(healthPercent) > 100 ? '100' : healthPercent
    }
  }, [healthPercent, type])

  return (
    <>
      {typeof resp === 'undefined' ? null : error ? (
        '?'
      ) : (
        <HealthColorText as="strong" colorKey={details?.status?.colorKey}>
          {type === 'status' ? details?.status?.label : formatNumber(parsedHealthModePercent, FORMAT_OPTIONS.PERCENT)}
        </HealthColorText>
      )}
    </>
  )
}

export default CellHealthStatus
