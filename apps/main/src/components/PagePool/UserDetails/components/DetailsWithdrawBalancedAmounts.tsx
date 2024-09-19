import type { SignerPoolDetailsResp } from '@/entities/signer'

import React, { useMemo } from 'react'
import { t } from '@lingui/macro'
import styled from 'styled-components'

import { useWithdrawDetails } from '@/entities/withdraw'
import { FORMAT_OPTIONS, formatNumber } from '@/ui/utils'
import { shortenTokenAddress } from '@/utils'
import { usePoolContext } from '@/components/PagePool/contextPool'

import { Chip } from '@/ui/Typography'
import Stats from '@/ui/Stats'

type Props = {
  lpUser: string | undefined
  userLiquidityUsd: SignerPoolDetailsResp['liquidityUsd'] | undefined
}

const DetailsWithdrawBalancedAmounts: React.FC<Props> = ({ lpUser = '', userLiquidityUsd }) => {
  const { poolBaseKeys, maxSlippage, isWrapped, pool, tokens } = usePoolContext()

  const { data: withdrawDetails } = useWithdrawDetails({
    ...poolBaseKeys,
    selected: 'balanced',
    selectedTokenAddress: '',
    amounts: [],
    lpToken: lpUser,
    maxSlippage,
    isWrapped,
  })

  const { expectedAmounts = [] } = withdrawDetails ?? {}

  const withdrawTotal = useMemo(() => {
    if (expectedAmounts.length === 0) return null

    return expectedAmounts.reduce((prev, a) => {
      prev += Number(a)
      return prev
    }, 0)
  }, [expectedAmounts])

  return (
    <TokensBalanceWrapper>
      <Chip size="md">{t`Balanced withdraw amounts`}</Chip>
      {tokens.map(({ symbol, address, haveSameTokenName }, idx) => {
        return (
          <Stats
            isOneLine
            isBorderBottom
            key={`${address}${idx}`}
            label={
              haveSameTokenName ? (
                <span>
                  {symbol} <Chip>{shortenTokenAddress(address)}</Chip>
                </span>
              ) : (
                symbol
              )
            }
          >
            <Chip as="strong" size="md" fontVariantNumeric="tabular-nums">
              {formatNumber(expectedAmounts[idx], { defaultValue: '-' })}
            </Chip>
          </Stats>
        )
      })}

      {!pool?.isCrypto && (
        <Stats isOneLine isBorderBottom label={`${tokens.map(({ symbol }) => symbol).join('+')}`}>
          <Chip as="strong" size="md" fontVariantNumeric="tabular-nums">
            {formatNumber(withdrawTotal, { defaultValue: '-' })}
          </Chip>
        </Stats>
      )}
      <Stats isOneLine label={t`USD balance`}>
        <Chip as="strong" size="md" fontVariantNumeric="tabular-nums">
          {formatNumber(userLiquidityUsd, { ...FORMAT_OPTIONS.USD, defaultValue: '-' })}
        </Chip>
      </Stats>
    </TokensBalanceWrapper>
  )
}

const TokensBalanceWrapper = styled.div`
  margin: 1rem;
`

export default DetailsWithdrawBalancedAmounts
