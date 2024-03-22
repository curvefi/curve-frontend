import type { ChipProps } from '@/ui/Typography/types'

import React, { useEffect, useMemo } from 'react'

import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import useStore from '@/store/useStore'

import { StyledInpChip } from '@/components/PageLoanManage/styles'
import TextCaption from '@/ui/TextCaption'

const ChipVaultSharesUsdRate = ({
  className = '',
  rChainId,
  rOwmId,
  amount,
  hideRate,
  noPadding,
  ...props
}: ChipProps & {
  className?: string
  rChainId: ChainId
  rOwmId: string
  amount: string | undefined
  hideRate?: boolean
  noPadding?: boolean
}) => {
  const owmData = useStore((state) => state.markets.owmDatasMapper[rChainId]?.[rOwmId])
  const { address = '' } = owmData?.owm?.borrowed_token ?? {}
  const usdRate = useStore((state) => state.usdRates.tokens[address])
  const pricePerShareResp = useStore((state) => state.markets.vaultPricePerShare[rChainId]?.[rOwmId])
  const fetchVaultPricePerShare = useStore((state) => state.markets.fetchVaultPricePerShare)

  const { pricePerShare, error } = pricePerShareResp ?? {}

  const isLoading =
    typeof owmData === 'undefined' || typeof amount === 'undefined' || typeof pricePerShareResp === 'undefined'
  const isError = !!error || usdRate === 'NaN'

  const { formattedCrvusdAmount, formattedUsdAmount } = useMemo(() => {
    const crvusdAmount = +pricePerShare * +(amount ?? '0')
    const formattedCrvusdAmount = `${formatNumber(crvusdAmount, { showDecimalIfSmallNumberOnly: true })}crvUSD`
    const usdAmount = +pricePerShare * +(amount ?? '0') * +usdRate
    const formattedUsdAmount = formatNumber(usdAmount, { ...FORMAT_OPTIONS.USD, defaultValue: '-' })
    return { formattedCrvusdAmount, formattedUsdAmount }
  }, [amount, pricePerShare, usdRate])

  useEffect(() => {
    if (!!owmData?.owm?.id && +(amount ?? '0') > 0) {
      fetchVaultPricePerShare(rChainId, owmData)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, owmData?.owm?.id])

  return (
    <>
      {isLoading ? null : isError ? (
        '?'
      ) : (
        <>
          {hideRate ? (
            <TextCaption className={className} {...props}>
              ≈{formattedCrvusdAmount} ({formattedUsdAmount})
            </TextCaption>
          ) : (
            <StyledInpChip noPadding={noPadding} className={className} size="xs">
              ≈{formattedCrvusdAmount} ({formattedUsdAmount})
            </StyledInpChip>
          )}
        </>
      )}
    </>
  )
}

export default ChipVaultSharesUsdRate
