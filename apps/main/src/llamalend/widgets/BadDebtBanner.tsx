import type { BadDebtMarketData } from '@/llamalend/hooks/useBadDebtMarket'
import { t, Trans } from '@ui-kit/lib/i18n'
import { Banner } from '@ui-kit/shared/ui/Banner'
import { LlamaMarketType } from '@ui-kit/types/market'
import { formatPercent, formatUsd } from '@ui-kit/utils'

type Props = {
  badDebt: BadDebtMarketData
}

const DENOMINATOR_LABEL: Record<LlamaMarketType, string> = {
  [LlamaMarketType.Lend]: t`of total supplied liquidity`,
  [LlamaMarketType.Mint]: t`of outstanding debt`,
}

export const BadDebtBanner = ({ badDebt: { badDebtUsd, percentage, marketType, severity } }: Props) => (
  <Banner
    severity={severity}
    subtitle={
      <Trans>
        This market currently includes approximately <strong>{formatUsd(badDebtUsd)}</strong> of bad debt , or about{' '}
        {formatPercent(percentage)} {DENOMINATOR_LABEL[marketType]}
      </Trans>
    }
  >
    {t`This market presents bad debt`}
  </Banner>
)
