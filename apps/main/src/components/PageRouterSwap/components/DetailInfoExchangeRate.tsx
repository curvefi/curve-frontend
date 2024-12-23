import type { ExchangeRate } from '@/components/PageRouterSwap/types'

import { t } from '@lingui/macro'
import styled from 'styled-components'

import { formatNumber, getFractionDigitsOptions } from '@/ui/utils'

import Box from '@/ui/Box'
import Chip from '@/ui/Typography/Chip'
import DetailInfo from '@/ui/DetailInfo'

const DetailInfoExchangeRate = ({
  exchangeRates,
  loading,
  ...rest
}: {
  exchangeRates?: ExchangeRate[] | null
  loading: boolean
  isMultiLine?: boolean
}) => (
  <StyledDetailInfo
    {...rest}
    label={
      <>
        {t`Exchange rate`} <Chip size="xs">{t`(incl. fees):`}</Chip>
      </>
    }
    loading={loading}
    loadingSkeleton={[150, 38]}
  >
    {Array.isArray(exchangeRates) && exchangeRates.length > 0 ? (
      <Box grid>
        {exchangeRates.map(({ from, to, value, label }) => (
          <Box key={label}>
            <Chip size="xs" fontVariantNumeric="tabular-nums" opacity={0.7}>
              {label}
            </Chip>
            &nbsp;&nbsp;
            <Chip
              isBold
              noWrap
              size="md"
              tooltip={`${formatNumber(1)} ${from} = ${formatNumber(value, { showAllFractionDigits: true })} ${to}`}
              tooltipProps={{
                placement: 'bottom end',
                noWrap: true,
              }}
            >
              {formatNumber(value, { ...getFractionDigitsOptions(value, 5) })}
            </Chip>
          </Box>
        ))}
      </Box>
    ) : (
      '-'
    )}
  </StyledDetailInfo>
)

const StyledDetailInfo = styled(DetailInfo)`
  align-items: flex-start;
`

export default DetailInfoExchangeRate
