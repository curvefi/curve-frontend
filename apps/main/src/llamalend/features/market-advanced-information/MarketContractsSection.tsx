import { ReactNode } from 'react'
import { zeroAddress } from 'viem'
import {
  getAmmAddress,
  getControllerAddress,
  getGaugeAddress,
  getTokens,
  getVaultAddress,
  getMonetaryPolicy,
} from '@/llamalend/llama.utils'
import type { MarketTemplate } from '@/llamalend/llamalend.types'
import { useMarketOracleAddress } from '@/llamalend/queries/market'
import type { LlamaMarket } from '@/llamalend/queries/market-list/llama-markets'
import type { IChainId } from '@curvefi/llamalend-api/lib/interfaces'
import { useIsMobile } from '@evm-ui/hooks/useBreakpoints'
import { useNewLlamaMarketDetailPage } from '@evm-ui/hooks/useFeatureFlags'
import { t } from '@evm-ui/lib/i18n'
import { ActionInfo, type ActionInfoProps } from '@evm-ui/shared/ui/ActionInfo'
import { AddressActionInfo } from '@evm-ui/shared/ui/AddressActionInfo'
import { Badge } from '@evm-ui/shared/ui/Badge'
import { TokenIcon, type TokenIconProps } from '@evm-ui/shared/ui/TokenIcon'
import { WithSkeleton } from '@evm-ui/shared/ui/WithSkeleton'
import { SizesAndSpaces } from '@evm-ui/themes/design/1_sizes_spaces'
import type { QueryProp } from '@evm-ui/types/util'
import { type BaseConfig } from '@legacy-ui/utils'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import { notFalsy } from '@primitives/objects.utils'

const { Spacing } = SizesAndSpaces

/** Either `address` (for a link) or `fallbackValue` (e.g. gauge = zeroAddress) is provided, not both */
type AddressItem = {
  key: string
  label: ReactNode
  address?: string
  fallbackValue?: ReactNode
  labelTooltip?: ActionInfoProps['labelTooltip']
}

type MarketContractsProps = {
  chainId: IChainId
  market: MarketTemplate | undefined
  apiMarket: QueryProp<LlamaMarket>
  network: BaseConfig | undefined
}

type MarketDataProps = Pick<MarketContractsProps, 'market' | 'apiMarket' | 'network'>

const GaugeLabel = () => (
  <Stack direction="row" sx={{ gap: Spacing.xs, alignItems: 'center' }}>
    <Typography variant="bodyMRegular" color="textSecondary">
      {t`Gauge`}
    </Typography>
    <Badge size="extraSmall" color="active" label={t`Active`} />
  </Stack>
)

const TokenLabel = ({ blockchainId, address, label, tooltip }: TokenIconProps & { label: string }) => (
  <Stack direction="row" sx={{ gap: Spacing.xs, alignItems: 'center' }}>
    <TokenIcon blockchainId={blockchainId} address={address} tooltip={tooltip} size="mui-md" />
    <Typography variant="bodyMRegular">{label}</Typography>
  </Stack>
)

const AssetRow = ({
  network,
  title,
  token,
  testId,
}: {
  network: BaseConfig | undefined
  title: ReactNode
  token: { symbol?: string; address?: string } | undefined
  testId: string
}) => (
  <Stack>
    <Typography variant="bodyMBold" color="textSecondary">
      {title}
    </Typography>
    <AddressActionInfo
      testId={testId}
      network={network}
      title={
        <TokenLabel
          blockchainId={network?.id}
          tooltip={token?.symbol}
          address={token?.address}
          label={token?.symbol ?? ''}
        />
      }
      address={token?.address}
    />
  </Stack>
)

export const MarketOverviewSkeleton = ({
  market,
  apiMarket,
  network,
  children,
}: MarketDataProps & { children: ReactNode }) => (
  <WithSkeleton loading={!network || (!market && !apiMarket.data)} variant="rectangular" height="4lh" width="100%">
    <Stack>{children}</Stack>
  </WithSkeleton>
)

export const MarketAssets = ({ market, apiMarket, network }: MarketDataProps) => {
  const { collateralToken, borrowToken } = getTokens(market, apiMarket.data) ?? {}

  return (
    <MarketOverviewSkeleton market={market} apiMarket={apiMarket} network={network}>
      <AssetRow
        testId="market-contract-collateral-token"
        network={network}
        title={t`Collateral`}
        token={collateralToken}
      />
      <AssetRow testId="market-contract-borrow-token" network={network} title={t`Borrowed`} token={borrowToken} />
    </MarketOverviewSkeleton>
  )
}

export const MarketContractsSection = ({ chainId, market, apiMarket, network }: MarketContractsProps) => {
  const isMobile = useIsMobile()
  const { data: onChainOracleAddress, isLoading: oracleAddressIsLoading } = useMarketOracleAddress({
    chainId,
    marketId: market?.id,
  })

  const hasContractData = !!market || !!apiMarket.data
  const contractsLoading = !network || !hasContractData || (!!market && oracleAddressIsLoading)
  const gaugeAddress = getGaugeAddress(market)
  const vaultAddress = getVaultAddress(market, apiMarket.data) ?? undefined
  const monetaryPolicyAddress = getMonetaryPolicy(market, apiMarket.data)
  const oracleAddress = market ? onChainOracleAddress : apiMarket.data?.oracleAddress

  const infraAddressItems = notFalsy<AddressItem>(
    hasContractData && { key: 'amm', label: t`AMM`, address: getAmmAddress(market, apiMarket.data) },
    vaultAddress && { key: 'vault', label: t`Vault`, address: vaultAddress },
    hasContractData && {
      key: 'controller',
      label: t`Controller`,
      address: getControllerAddress(market, apiMarket.data),
    },
    (market ?? monetaryPolicyAddress) && {
      key: 'monetary-policy',
      label: t`Rate policy`,
      labelTooltip: {
        title: t`The rule set that controls how fast borrow costs rise or fall as market conditions change.`,
      },
      address: monetaryPolicyAddress,
    },
    gaugeAddress &&
      (gaugeAddress === zeroAddress
        ? { key: 'gauge', label: t`Gauge`, fallbackValue: t`No gauge` }
        : { key: 'gauge', label: <GaugeLabel />, address: gaugeAddress }),
    (market ?? oracleAddress) && { key: 'oracle', label: t`Oracle`, address: oracleAddress },
  )

  return (
    <Stack data-testid="market-contracts-section">
      {!useNewLlamaMarketDetailPage() && (
        <Card size="inline" data-testid="market-assets-section">
          <CardHeader title={t`Assets`} />
          <CardContent component={Stack} sx={{ marginBlock: Spacing.sm }}>
            <MarketAssets market={market} apiMarket={apiMarket} network={network} />
          </CardContent>
        </Card>
      )}

      <Card size="inline">
        <CardHeader title={isMobile ? t`Market Contracts` : t`Contracts`} />
        <CardContent component={Stack} sx={{ marginBlock: Spacing.sm }}>
          <WithSkeleton loading={contractsLoading} variant="rectangular" height="8lh" width="100%">
            <Stack>
              {infraAddressItems.map(({ key, label, labelTooltip, address, fallbackValue }) =>
                fallbackValue != null ? (
                  <ActionInfo
                    key={key}
                    testId={`market-contract-${key}`}
                    label={label}
                    labelTooltip={labelTooltip}
                    value={fallbackValue}
                  />
                ) : (
                  <AddressActionInfo
                    key={key}
                    testId={`market-contract-${key}`}
                    network={network}
                    title={label}
                    labelTooltip={labelTooltip}
                    address={address}
                  />
                ),
              )}
            </Stack>
          </WithSkeleton>
        </CardContent>
      </Card>
    </Stack>
  )
}
