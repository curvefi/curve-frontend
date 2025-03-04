import { useMemo } from 'react'
import isUndefined from 'lodash/isUndefined'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import useStore from '@/lend/store/useStore'

const CellHealthStatus = ({ userActiveKey, type }: { userActiveKey: string; type: 'range' | 'band' | 'bandPct' }) => {
  const resp = useStore((state) => state.user.loansDetailsMapper[userActiveKey])

  const { details, error } = resp ?? {}

  const liqPriceRange = useMemo(() => {
    const [price1, price2] = details?.prices ?? []
    const [band1, band2] = details?.bands ?? []

    if (!isUndefined(price1) && !isUndefined(price2) && !isUndefined(band1) && !isUndefined(band2)) {
      const parsedPrice1 = `${formatNumber(price1, { maximumFractionDigits: 2 })}`
      const parsedPrice2 = `${formatNumber(price2, { maximumFractionDigits: 2 })}`
      return { price1: parsedPrice1, price2: parsedPrice2, band1, band2 }
    }
  }, [details])

  return (
    <>
      {error ? (
        '?'
      ) : !liqPriceRange || !details ? (
        '-'
      ) : type === 'range' ? (
        <strong>{`${liqPriceRange.price2} to ${liqPriceRange.price1}`}</strong>
      ) : type === 'band' ? (
        <strong>{`${liqPriceRange.band2} to ${liqPriceRange.band1}`}</strong>
      ) : type === 'bandPct' ? (
        <strong>{formatNumber(details.bandsPct, FORMAT_OPTIONS.PERCENT)}</strong>
      ) : null}
    </>
  )
}

export default CellHealthStatus
