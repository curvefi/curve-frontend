import { styled } from 'styled-components'
import type { ExchangeRate } from '@/dex/components/PageRouterSwap/types'
import { Box } from '@ui/Box'
import { DetailInfo } from '@ui/DetailInfo'
import { Chip } from '@ui/Typography/Chip'
import { formatNumber, getFractionDigitsOptions } from '@ui/utils'
import { t } from '@ui-kit/lib/i18n'

export const DetailInfoExchangeRate = ({
  exchangeRates,
  loading,
}: {
  exchangeRates?: ExchangeRate[] | null
  loading: boolean
}) => (
  <StyledDetailInfo
    isMultiLine={exchangeRates != null && exchangeRates.length > 1}
    label={
      <>
        {t`Exchange rate`} <Chip size="xs">{t`(incl. fees):`}</Chip>
      </>
    }
    loading={loading}
    loadingSkeleton={[150, 38]}
    testId="exchange-rate"
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
              tooltip={`${formatNumber(1)} ${from} = ${formatNumber(value, { decimals: 5 })} ${to}`}
              tooltipProps={{ placement: 'bottom-end', noWrap: true }}
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
