import { styled } from 'styled-components'
import { RewardBase, PoolData, PoolDataCache } from '@/dex/types/main.types'
import Box from '@mui/material/Box'
import { Chip } from '@ui/Typography'
import { FORMAT_OPTIONS, formatNumber } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

export const TooltipBaseApy = ({
  baseApy,
  poolData,
}: {
  baseApy: RewardBase | undefined
  poolData: PoolDataCache | PoolData | undefined
}) => {
  let label = t`Pool APY`

  if (poolData?.pool.isLending) {
    label = t`Pool APY + Lending APY`
  } else if (poolData?.tokenAddresses.indexOf('0xae7ab96520de3a18e5e111b5eaab095312d7fe84') !== -1) {
    // hard coding steth label, not defined in pool object
    label = t`Pool APY + Staking APY`
  } else if (
    poolData?.pool?.implementation === '0x36dc03c0e12a1c241306a6a8f327fe28ba2be5b0' ||
    poolData?.pool?.implementation === '0x7ca46a636b02d4abc66883d7ff164bde506dc66a'
  ) {
    label = t`Pool APY + Interest APY`
  }

  return (
    <Box>
      <Title>
        {label} <Chip size="xs">(annualized)</Chip>
      </Title>
      <ul>
        <li>Daily: {formatNumber(baseApy?.day, FORMAT_OPTIONS.PERCENT)}</li>
        <li>Weekly: {formatNumber(baseApy?.week, FORMAT_OPTIONS.PERCENT)}</li>
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
