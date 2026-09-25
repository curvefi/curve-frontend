import { styled } from 'styled-components'
import { RewardBase } from '@/dex/types/main.types'
import type { PoolTemplate } from '@curvefi/api/lib/pools'
import { Chip } from '@legacy-ui/Typography'
import Box from '@mui/material/Box'
import { formatNumber } from '@primitives/number.utils'
import { amount } from '@ui/lib/decimal'
import { t } from '@ui/lib/i18n'

export const LegacyTooltipBaseApy = ({
  baseApy,
  pool,
}: {
  baseApy: RewardBase | undefined
  pool: PoolTemplate | undefined
}) => {
  let label = t`Pool APY`

  if (pool?.isLending) {
    label = t`Pool APY + Lending APY`
  } else if (
    pool?.implementation === '0x36dc03c0e12a1c241306a6a8f327fe28ba2be5b0' ||
    pool?.implementation === '0x7ca46a636b02d4abc66883d7ff164bde506dc66a'
  ) {
    label = t`Pool APY + Interest APY`
  }

  return (
    <Box>
      <Title>
        {label} <Chip size="xs">(annualized)</Chip>
      </Title>
      <ul>
        <li>Daily: {formatNumber(amount(baseApy?.day), 'percent.value')}</li>
        <li>Weekly: {formatNumber(amount(baseApy?.week), 'percent.value')}</li>
      </ul>

      {baseApy?.day && Number(baseApy.day) < 0 && (
        <NegativeBaseApy>
          {t`Base vAPY can temporarily be negative when A parameter is ramped down, or crypto pools spend profit to rebalance.`}
        </NegativeBaseApy>
      )}
    </Box>
  )
}

const Title = styled.p`
  font-weight: bold;
  margin-bottom: var(--spacing-1);
  white-space: nowrap;
`

const NegativeBaseApy = styled(Chip)`
  display: block;
  margin-top: var(--spacing-2);
`
