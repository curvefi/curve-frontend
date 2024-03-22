import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import { HealthColorText } from '@/components/DetailsUser/styles'

const CellHealthStatus = ({ userActiveKey, type }: { userActiveKey: string; type: 'status' | 'percent' }) => {
  const resp = useStore((state) => state.user.loansDetailsMapper[userActiveKey])

  const { details, error } = resp ?? {}

  return (
    <>
      {typeof resp === 'undefined' ? null : error ? (
        '?'
      ) : (
        <HealthColorText as="strong" colorKey={details?.status?.colorKey}>
          {type === 'status' ? details?.status?.label : formatNumber(details?.healthFull, FORMAT_OPTIONS.PERCENT)}
        </HealthColorText>
      )}
    </>
  )
}

export default CellHealthStatus
