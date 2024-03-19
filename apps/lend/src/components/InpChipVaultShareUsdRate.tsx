import type { ChipProps } from '@/ui/Typography/types'

import React, { useCallback, useEffect, useState } from 'react'

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
  const usdRatesMapper = useStore((state) => state.usdRates.tokens)

  const { address } = owmData?.owm?.borrowed_token ?? {}

  const [tokenUsdRate, setTokenUsdRate] = useState(0)
  const [usdAmount, setUsdAmount] = useState(0)

  const haveOwmData = typeof owmData !== 'undefined'
  const haveAmount = typeof amount !== 'undefined' && +amount > 0

  const fetchRedeemUsdValue = useCallback(
    async (owmData: OWMData, amount: string) => {
      try {
        const borrowedAmount = await owmData.owm.vault.previewRedeem(1)
        const usdRate = usdRatesMapper[address]

        if (+borrowedAmount > 0 && +usdRate > 0) {
          setTokenUsdRate(+borrowedAmount * +usdRate)
          setUsdAmount(+borrowedAmount * +amount * +usdRate)
        } else if (usdRate === 'NaN') {
          setUsdAmount(NaN)
        }
      } catch (error) {
        console.error(error)
        setUsdAmount(NaN)
      }
    },
    [address, usdRatesMapper]
  )

  useEffect(() => {
    if (haveOwmData && haveAmount) fetchRedeemUsdValue(owmData, amount)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, owmData])

  const formattedAmountUsd = formatNumber(usdAmount, { ...FORMAT_OPTIONS.USD, defaultValue: '-' })

  return (
    <>
      {haveOwmData && haveAmount && (
        <>
          {hideRate ? (
            <TextCaption className={className} {...props}>
              {formattedAmountUsd}
            </TextCaption>
          ) : (
            <StyledInpChip noPadding={noPadding} className={className} size="xs">
              x {formatNumber(tokenUsdRate)} ≈{formattedAmountUsd}
            </StyledInpChip>
          )}
        </>
      )}
    </>
  )
}

export default ChipVaultSharesUsdRate
