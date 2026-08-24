import type { ExchangeRate } from '@/dex/components/PageRouterSwap/types'
import { t } from '@evm-ui/lib/i18n'
import { formatNumber, getFractionDigitsOptions } from '@evm-ui/utils'
import { Box } from '@legacy-ui/Box'
import { DetailInfo } from '@legacy-ui/DetailInfo'
import { Chip } from '@legacy-ui/Typography/Chip'

export const DetailInfoExchangeRate = ({
  exchangeRates,
  loading,
}: {
  exchangeRates?: ExchangeRate[] | null
  loading: boolean
}) => (
  <DetailInfo
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
              tooltip={`${formatNumber(1, { abbreviate: false })} ${from} = ${formatNumber(value, { decimals: 5, abbreviate: false })} ${to}`}
              tooltipProps={{ placement: 'bottom-end', noWrap: true }}
            >
              {formatNumber(value, { ...getFractionDigitsOptions(value, 5), abbreviate: false })}
            </Chip>
          </Box>
        ))}
      </Box>
    ) : (
      '-'
    )}
  </DetailInfo>
)
